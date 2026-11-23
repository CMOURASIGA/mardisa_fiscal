from mysql.connector import Error



def create_database_query(db_name):
   
    query = f"CREATE DATABASE `{db_name}`"

    return query
        
