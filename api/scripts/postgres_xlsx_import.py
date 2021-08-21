import psycopg2, psycopg2.extras, csv, sys, uuid, datetime, os
from os.path import join, dirname
import usaddress
from dotenv import load_dotenv
import re
from openpyxl import load_workbook
urlregex = re.compile(
        r'^(?:http|ftp)s?://' # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
        r'localhost|' #localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
        r'(?::\d+)?' # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)

def clean_string(in_str):
    return '' if in_str == None else in_str.replace(u"\u0027", "'").replace(u"\u200b","")

def clean_phone(in_phone_str):
    if in_phone_str == None:
        return None
    try:
        return int(re.sub(r'\D','',in_phone_str))
    except ValueError:
        return None

def province_name_to_province_code(name):
    return name.upper().replace("ALBERTA","AB").replace("BRITISH COLUMBIA","BC").replace("SASKATCHEWAN","SK").replace("MANITOBA","MB").replace("ONTARIO","ON").replace("QUEBEC","QC").replace("NOVA SCOTIA","NS").replace("NEW BRUNSWICK","NB")

def parse_address(addr,postalcode,neighbourhood):
    try:
        parsed = usaddress.tag(addr.replace("\r\n"," ").replace("\n"," "))
        print(addr)
        print(parsed)
        pd = parsed[0]
        address1 = u""
        if 'AddressNumber' in pd and 'StreetName' in pd and 'StreetNamePostType' in pd:
            address1 += pd['AddressNumber'] + " " + pd['StreetName'] + " " + pd['StreetNamePostType']
        else:
            print("Error parsing Address for '" + addr + "'")
            address1 += input("Please enter Address:" )

        if 'StreetNamePostDirectional' in pd:
            address1 += ' ' + pd['StreetNamePostDirectional']
        print(address1)
        address2 = ""
        if 'OccupancyIdentifier' in pd:
            address2 = pd['OccupancyIdentifier']
        print(address2)
        address3 = ""
        city = ""
        if 'PlaceName' in pd:
            city = pd['PlaceName']
        province = ""
        if 'StateName' in pd:
            province = province_name_to_province_code(pd['StateName'])
        country = u"CA"
        full = addr
        return (address1,address2,address3,city,province,country,postalcode,neighbourhood,full)
    except Exception:
        return None


def valid_url(url):
    return re.match(urlregex, url) is not None

def parse_row(row,fields,maincategory,prev_name):
    merchant_name = row[fields['Name']]
    cur.execute(u"SELECT id FROM \"Merchants\" WHERE title iLike %s",(merchant_name,))
    merchantid = None
    result = cur.fetchone()
    update = False
    if (result != None):
        merchantid = result[0]
        update = True
    else:
        merchantid = uuid.uuid4()
    
    address_only = True
    if merchant_name != prev_name:
        address_only = False
        website = row[fields['Website']]
        if website != None:
            if website == 'n/a' or website == 'N/A':
                website = None
            elif len(website) == 0:
                website = None
            elif website.find('http') == -1:
                website = 'https://' + website
        merchant_type = None
        merchant_desc = row[fields['Description']]
        if 'Type' in fields:
            merchant_type = row[fields['Type']]
        merchant_onlineShopping = False
        if ('Online Shopping' in fields) and (row[fields['Online Shopping']] != None):
            merchant_onlineShopping = row[fields['Online Shopping']].upper() == 'YES'
        if (update):
            print('UPDATE ' + str(merchantid) + " - " + merchant_name)
            cur.execute(u"UPDATE \"Merchants\" SET (title,description,type,website,\"onlineShopping\",\"updatedAt\") = (%s, %s, %s, %s, %s, %s) WHERE id = %s",(clean_string(merchant_name), clean_string(merchant_desc), merchant_type, website, merchant_onlineShopping, datetime.datetime.now(),psycopg2.extras.UUID_adapter(merchantid)))
        else:
            cur.execute(u"INSERT INTO \"Merchants\" (id,title,description,type,website,\"onlineShopping\",\"createdAt\",\"updatedAt\") VALUES(%s, %s, %s, %s, %s, %s, %s, %s)",(psycopg2.extras.UUID_adapter(merchantid),clean_string(merchant_name), clean_string(merchant_desc), merchant_type, website, merchant_onlineShopping, datetime.datetime.now(), datetime.datetime.now()))
    else:
        print('Inserting additional address for merchant ' + prev_name)
    # INSERT ADDRESS
    merchant_address = row[fields['Address']]
    merchant_postal_code = None
    if 'Postal Code' in fields:
        merchant_postal_code = row[fields['Postal Code']]
    merchant_neighbourhood = None
    if 'Neighbourhood' in fields:
        merchant_neighbourhood = row[fields['Neighbourhood']]
    merchant_email = None
    if 'Email' in fields:
        merchant_email = row[fields['Email']]
    merchant_phone = None
    if 'Phone' in fields:
        merchant_phone = row[fields['Phone']]
    # Clear out current addresses - only if this is the first address.
    if not(address_only):
        cur.execute(u"DELETE FROM \"Contacts\" C WHERE C.\"AddressId\" in (SELECT MA.\"AddressId\" FROM \"MerchantAddresses\" MA WHERE MA.\"MerchantId\" = %s)",(merchantid,))
        cur.execute(u"DELETE FROM \"Addresses\" A WHERE A.id in (SELECT MA.\"AddressId\" FROM \"MerchantAddresses\" MA WHERE MA.\"MerchantId\" = %s)",(merchantid,))
        # Shouldn't have to delete from join table, should cascade delete.
        # cur.execute(u"DELETE FROM \"MerchantAddresses\" WHERE \"MerchantId\" = %s",merchantid)
    if (merchant_address != None and len(merchant_address) > 0):
        addr = parse_address(merchant_address,merchant_postal_code,merchant_neighbourhood)
        if addr == None:
            print('Error Parsing Address "' + merchant_address + '". Skipping.')
        else:
            cur.execute(u"INSERT INTO \"Addresses\" (address1,address2,address3,city,province,country,postalcode,neighbourhood,\"full\") VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",addr)
            result = cur.fetchone()
            if (result != None):
                cur.execute(u"INSERT INTO \"MerchantAddresses\" (\"createdAt\",\"updatedAt\",\"MerchantId\",\"AddressId\") VALUES (%s, %s, %s, %s)",(datetime.datetime.now(), datetime.datetime.now(),merchantid,result[0]))
                # INSERT CONTACT
                cur.execute(u"INSERT INTO \"Contacts\" (\"AddressId\",email,phone,\"createdAt\",\"updatedAt\") VALUES(%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",(result[0],merchant_email,clean_phone(merchant_phone),datetime.datetime.now(), datetime.datetime.now()))
    else:
        print('No address found for ' + merchant_name + ' or address length was zero.')
    if address_only:
        return

    # INSERT TAGS
    if row[fields['Keywords']] != None and len(row[fields['Keywords']]) > 0:
        tags = row[fields['Keywords']].replace("\r\n"," ").replace(","," ").replace("\n"," ").split(" ")
        tags.extend(merchant_name.split(" "))
        tags = list(filter(lambda x: x != None and len(x) >= 3,tags))
        for tag in tags:
            cur.execute(u"SELECT id FROM \"Tags\" WHERE \"tag\" = UPPER(%s)", (tag,))
            tagid = None
            result = cur.fetchone()
            if (result == None):
                print("Inserting new tag: " + tag)
                cur.execute(u"INSERT INTO \"Tags\" (\"tag\") VALUES(UPPER(%s)) RETURNING id",(tag,))
                result = cur.fetchone()
                if (result != None):
                    tagid = result[0]
            else:
                tagid = result[0]
            cur.execute(u"INSERT INTO \"MerchantTags\" (\"createdAt\",\"updatedAt\",\"MerchantId\",\"TagId\") VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",(datetime.datetime.now(), datetime.datetime.now(),merchantid,tagid))
    # INSERT CATEGORIES
    categories = []
    if row[fields['Related Categories']] != None and len(row[fields['Related Categories']]) > 0:
        categories = [(s.strip(),) for s in list(filter(lambda x: x != None and len(x) >= 3,row[fields['Related Categories']].replace("\r\n"," ").replace("\n"," ").split(",")))]
    categories.append((maincategory,))
    for category in categories:
        cur.execute(u"SELECT id FROM \"Categories\" WHERE \"category\" = UPPER(%s)",category)
        catid = None
        result = cur.fetchone()
        if (result == None):
            print("No exact match found for category '" + category[0] + "'. Trying similar categories...")
            cur.execute(u"SELECT id FROM \"Categories\" WHERE \"category\" iLike '%%' || UPPER(%s) || '%%'",category)
            results = cur.fetchall()
            for result in results:
                catid = result[0]
                cur.execute(u"INSERT INTO \"MerchantCategories\" (\"createdAt\",\"updatedAt\",\"MerchantId\",\"CategoryId\") VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",(datetime.datetime.now(), datetime.datetime.now(),merchantid,catid))
        else:
            catid = result[0]
            cur.execute(u"INSERT INTO \"MerchantCategories\" (\"createdAt\",\"updatedAt\",\"MerchantId\",\"CategoryId\") VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",(datetime.datetime.now(), datetime.datetime.now(),merchantid,catid))
    # INSERT SOCIAL MEDIA LINKS
    for social in [('Twitter',row[fields['Twitter']]),('Facebook',row[fields['Facebook']]),('Instagram',row[fields['Instagram']]),('Pinterest',row[fields['Pinterest']])]:
        if (social[1] == ''): 
            continue
        if social[1] != None:
            if valid_url(social[1]):
                cur.execute(u"DELETE FROM \"SocialMediaLinks\" WHERE \"MerchantId\" = %s AND name = UPPER(%s) AND \"displayName\" = %s and url = %s",(merchantid,social[0],social[0],social[1]))
                cur.execute(u"INSERT INTO \"SocialMediaLinks\" (\"MerchantId\",name,\"displayName\",url) VALUES(%s, UPPER(%s), %s, %s) ON CONFLICT DO NOTHING",(merchantid,social[0],social[0],social[1]))
            else:
                print('Failed to insert social media link for ' + social[0] + ', invalid url: ' + social[1])
    # INSERT LOGOS
    cur.execute(u"SELECT i.id FROM \"MerchantImages\" mi JOIN \"Images\" i ON mi.\"ImageId\" = i.id WHERE mi.\"MerchantId\" = %s AND i.type = %s",(merchantid,'LOGO'))
    result = cur.fetchone()
    if (result == None):
        try:
            with open("./data/logos/"+merchant_name+".png", "rb") as f: 
                imagedata = psycopg2.Binary(f.read())
                cur.execute(u"INSERT INTO \"Images\" (title,type,image,\"createdAt\",\"updatedAt\") VALUES (%s,UPPER(%s),%s,%s,%s) RETURNING id",('Logo','LOGO',imagedata,datetime.datetime.now(),datetime.datetime.now()))
                result = cur.fetchone()
                if (result != None):
                    cur.execute(u"INSERT INTO \"MerchantImages\" (\"createdAt\",\"updatedAt\",\"MerchantId\",\"ImageId\") VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",(datetime.datetime.now(), datetime.datetime.now(),merchantid,result[0]))
                    print('Inserted image for '+merchant_name)
        except IOError:
            print("Could not find '"+"./data/logos/"+merchant_name+".png'")

def parse_sheet(sheet):
    maincategory = sheet.title.strip()
    use_name_as_cat = input(f"Is '{maincategory}' the category? (y(default)/n/skip/exit): ")
    if (use_name_as_cat == "n"):
        maincategory = input("Enter category:")
    elif (use_name_as_cat == "skip" or use_name_as_cat == "s"):
        return True
    elif (use_name_as_cat == "exit" or use_name_as_cat == "e"):
        return False
    print('Category: ' + maincategory)
    cur.execute(u"INSERT INTO \"Categories\"(category) VALUES(UPPER(%s)) ON CONFLICT DO NOTHING",(maincategory,))
    field_dict = {}
    first_row = True
    prev_name = None
    for row in sheet.values:
        if first_row:
            first_row = False
            for index, value in enumerate(row):
                if value != None:
                    field_dict[value] = index
        else:
            name = row[field_dict['Name']]
            if name == None:
                continue
            parse_row(row,field_dict,maincategory,prev_name)
            prev_name = name
    if input(f"Commit?: ") == "y":
        conn.commit()
    else:
        conn.rollback()
    if input("Continue?: ") == "n":
        return False
    else:
        return True

def parse_excel(filepath):
    wb = load_workbook(filepath)
    for sheet in wb:
        if not parse_sheet(sheet):
            break



if len(sys.argv) < 2:
    print('must specify filepath')
    sys.exit(0)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

conn = psycopg2.connect(dbname=os.getenv('POSTGRES_DB'),user=os.getenv('POSTGRES_USER'),password=os.getenv('POSTGRES_PASS'),host=os.getenv('POSTGRES_HOST'),port=os.getenv('POSTGRES_PORT'))

cur = conn.cursor()

psycopg2.extras.register_uuid()

filepath = sys.argv[1]
if os.path.isfile(filepath):
    parse_excel(filepath)
else:
    print("Invalid path: " + filepath)

cur.close()

conn.close()