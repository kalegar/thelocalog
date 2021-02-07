import psycopg2, psycopg2.extras, csv, sys, uuid, datetime, os
from os.path import join, dirname
import usaddress
from dotenv import load_dotenv
import re
urlregex = re.compile(
        r'^(?:http|ftp)s?://' # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|' #domain...
        r'localhost|' #localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})' # ...or ip
        r'(?::\d+)?' # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)

if len(sys.argv) < 2:
    print('must specify filepath')
    sys.exit(0)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)

filepath = sys.argv[1]
filename = os.path.splitext(os.path.basename(filepath))[0]
maincategory = filename
use_filename_as_cat = input(f"Is '{filename}' the category? (y(default)/n): ")
if (use_filename_as_cat == "n"):
    maincategory = input("Enter category:")
print('Category: ' + maincategory)

conn = psycopg2.connect(dbname=os.getenv('POSTGRES_DB'),user=os.getenv('POSTGRES_USER'),password=os.getenv('POSTGRES_PASS'),host=os.getenv('POSTGRES_HOST'),port=os.getenv('POSTGRES_PORT'))

cur = conn.cursor()

psycopg2.extras.register_uuid()

def parse_address(addr,postalcode,neighbourhood):
    parsed = usaddress.tag(addr)
    print(addr)
    print(parsed)
    pd = parsed[0]
    address1 = u" ".join((pd['AddressNumber'],pd['StreetName'],pd['StreetNamePostType']))
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
        province = pd['StateName']
    country = u"CA"
    full = addr
    return (address1,address2,address3,city,province,country,postalcode,neighbourhood,full)

def valid_url(url):
    return re.match(urlregex, url) is not None

with open(filepath, newline='') as csvfile:
    creader = csv.DictReader(csvfile, skipinitialspace=True)
    print(creader.fieldnames)
    for row in creader:
        # INSERT MERCHANT
        cur.execute(u"SELECT id,description FROM \"Merchants\" WHERE title iLike %s",(row['Name'],))
        merchantid = None
        result = cur.fetchone()
        if (result != None):
            merchantid = result[0]
            print(result[1])
        else:
            merchantid = uuid.uuid4()
            cur.execute(u"INSERT INTO \"Merchants\" (id,title,description,website,\"createdAt\",\"updatedAt\") VALUES(%s, %s, %s, %s, %s, %s)",(psycopg2.extras.UUID_adapter(merchantid),row['Name'], row['Description'], row['Website'], datetime.datetime.now(), datetime.datetime.now()))
        # INSERT ADDRESS
        if (row['Address'] != None and len(row['Address']) > 0):
            cur.execute(u"SELECT id FROM \"Addresses\" WHERE \"full\" = %s",(row['Address'],))
            result = cur.fetchone()
            if (result == None):
                addr = usaddress.parse(row['Address'])
                cur.execute(u"INSERT INTO \"Addresses\" (address1,address2,address3,city,province,country,postalcode,neighbourhood,\"full\") VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",parse_address(row['Address'],row['Postal Code'],row['Neighbourhood']))
                result = cur.fetchone()
                if (result != None):
                    cur.execute(u"INSERT INTO \"MerchantAddresses\" (\"createdAt\",\"updatedAt\",\"MerchantId\",\"AddressId\") VALUES (%s, %s, %s, %s)",(datetime.datetime.now(), datetime.datetime.now(),merchantid,result[0]))
                    # INSERT CONTACT
                    cur.execute(u"INSERT INTO \"Contacts\" (\"AddressId\",email,phone,\"createdAt\",\"updatedAt\") VALUES(%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",(result[0],row["Email"],row["Phone"],datetime.datetime.now(), datetime.datetime.now()))
        
        # INSERT TAGS
        tags = row['Keywords'].replace("\r\n"," ").replace(","," ").replace("\n"," ").split(" ")
        tags.extend(row['Name'].split(" "))
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
        categories = [(s.strip(),) for s in list(filter(lambda x: x != None and len(x) >= 3,row['Related Categories'].replace("\r\n"," ").replace("\n"," ").split(",")))]
        categories.append((maincategory,))
        for category in categories:
            cur.execute(u"SELECT id FROM \"Categories\" WHERE \"category\" = UPPER(%s)",category)
            catid = None
            result = cur.fetchone()
            if (result == None):
                print('Skipped category ' + category[0] + ' for merchant ' + row['Name'] + '. Does not exist!')
                continue
                # cur.execute(u"INSERT INTO \"Categories\"(\"category\" VALUES(UPPER(%s)) RETURNING id",category)
                # result = cur.fetchone()
                # if (result != None):
                #     catid = result[0]
            else:
                catid = result[0]
            cur.execute(u"INSERT INTO \"MerchantCategories\" (\"createdAt\",\"updatedAt\",\"MerchantId\",\"CategoryId\") VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",(datetime.datetime.now(), datetime.datetime.now(),merchantid,catid))
        # INSERT SOCIAL MEDIA LINKS
        for social in [('Twitter',row['Twitter']),('Facebook',row['Facebook']),('Instagram',row['Instagram']),('Pinterest',row['Pinterest'])]:
            if (social[1] == ''): 
                continue
            if valid_url(social[1]):
                cur.execute(u"INSERT INTO \"SocialMediaLinks\" (\"MerchantId\",name,\"displayName\",url) VALUES(%s, UPPER(%s), %s, %s) ON CONFLICT DO NOTHING",(merchantid,social[0],social[0],social[1]))
            else:
                print('Failed to insert social media link for ' + social[0] + ', invalid url: ' + social[1])
        # INSERT LOGOS
        cur.execute(u"SELECT i.id FROM \"MerchantImages\" mi JOIN \"Images\" i ON mi.\"ImageId\" = i.id WHERE mi.\"MerchantId\" = %s AND i.type = %s",(merchantid,'LOGO'))
        result = cur.fetchone()
        if (result == None):
            try:
                with open("./data/logos/"+row['Name']+".png", "rb") as f: 
                    imagedata = psycopg2.Binary(f.read())
                    cur.execute(u"INSERT INTO \"Images\" (title,type,image,\"createdAt\",\"updatedAt\") VALUES (%s,UPPER(%s),%s,%s,%s) RETURNING id",('Logo','LOGO',imagedata,datetime.datetime.now(),datetime.datetime.now()))
                    result = cur.fetchone()
                    if (result != None):
                        cur.execute(u"INSERT INTO \"MerchantImages\" (\"createdAt\",\"updatedAt\",\"MerchantId\",\"ImageId\") VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",(datetime.datetime.now(), datetime.datetime.now(),merchantid,result[0]))
                        print('Inserted image for '+row['Name'])
            except IOError:
                print("Could not find '"+"./data/logos/"+row['Name']+".png'")
    conn.commit()

cur.close()

conn.close()