


from nfs.src.db.db_pipelines.db_connection_meta import connect_mysql_by_id
from nfs.src.db.db_query.cod_table_query import delete_by_id, insert_row, update_by_id


def delete_code(enterprise_id, row_id):
    connection = connect_mysql_by_id(enterprise_id)
    return delete_by_id(row_id, connection)


def update_code(enterprise_id, row_id, content_list):
    connection = connect_mysql_by_id(enterprise_id)
    return update_by_id(row_id, content_list, connection)


def insert_code(enterprise_id, content_list):
    connection = connect_mysql_by_id(enterprise_id)
    return insert_row(content_list, connection)