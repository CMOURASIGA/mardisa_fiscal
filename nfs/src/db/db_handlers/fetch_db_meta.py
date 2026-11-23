
from mysql.connector import Error
from nfs.src.db.db_handlers.my_SQL_handler import  *
from django.core.exceptions import ObjectDoesNotExist
from api.Models.model_db import DatabaseConnection


from django.core.exceptions import ObjectDoesNotExist

def get_mysql_connection(db_id):
    
    
    try:
        db_obj = DatabaseConnection.objects.get(id=db_id)
    except ObjectDoesNotExist:
        raise ValueError(f"No DatabaseConnection found for id={db_id}")

    if db_obj.db_type != "mysql":
        raise ValueError("DatabaseConnection is not of type MySQL")

    return {
        "hostname": db_obj.hostname,
        "username": db_obj.username,
        "password": db_obj.password,  
        "db_name": db_obj.db_name,
        "port": db_obj.port,
    }
