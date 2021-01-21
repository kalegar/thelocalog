import psycopg2, sys, os
from os.path import join, dirname
from dotenv import load_dotenv

if len(sys.argv) < 2:
    print('Must specify filepath')
    sys.exit(0)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)
filepath = sys.argv[1]

file1 = open(filepath, 'r')
lines = file1.readlines()

tuples = []
for line in lines:
    tuples.append((u""+line.replace("\n",""),))

print(tuples)

conn = psycopg2.connect(dbname=os.getenv('POSTGRES_DB'),user=os.getenv('POSTGRES_USER'),password=os.getenv('POSTGRES_PASS'),host=os.getenv('POSTGRES_HOST'),port=os.getenv('POSTGRES_PORT'))

cur = conn.cursor()

cur.executemany("INSERT INTO \"Categories\"(category) VALUES(UPPER(%s)) ON CONFLICT DO NOTHING",tuples)
conn.commit()

cur.close()

conn.close()