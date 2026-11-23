import mysql.connector
from mysql.connector import Error


def execute_query(connection, query, fetch_results):
   

    try:
        cursor = connection.cursor()
        cursor.execute(query)

        if fetch_results:
            results = cursor.fetchall()
            return results
        else:
            #connection.commit() 
            return None

    except Exception as e:
        print(f"Error executing query: {e}")
        return None

    