

from nfs.src.db.db_connectors.my_sql_connectors import connect_mysql_db
from nfs.src.db.db_handlers.fetch_db_meta import get_mysql_connection


def connect_mysql_by_id(id):
    try:
        db_data = get_mysql_connection(id)
        hostname = db_data['hostname']
        username = db_data['username']
        password = db_data['password']
        db_name = db_data['db_name']
        port = int(db_data['port'])

            
        connection = connect_mysql_db(hostname, username, password, db_name, port)

        return connection
    
    except Exception as e:
        msg = f"An error occurred: {e}"
        if connection and connection.is_connected():
            connection.close()
        
        
