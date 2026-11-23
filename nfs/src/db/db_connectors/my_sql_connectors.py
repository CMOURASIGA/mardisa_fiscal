import mysql.connector
from mysql.connector import Error

def connect_mysql_server(host, user, password, port):
    
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            port=port
            
        )

        if conn.is_connected():
            print("Conexão realizada com sucesso!")
        return conn

    except Error as e:
        print(f"Error connecting to MySQL server: {e}")
        return None



def connect_mysql_db(host, user, password, database, port):
    
    try:
        conn = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database,
            port=port
        )
        return conn
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None
