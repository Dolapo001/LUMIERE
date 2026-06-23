from django.db import connection
try:
    with connection.cursor() as cursor:
        cursor.execute('CREATE EXTENSION IF NOT EXISTS vector')
        print('PGVector extension installed/verified')
except Exception as e:
    print(f'Error: {e}')
