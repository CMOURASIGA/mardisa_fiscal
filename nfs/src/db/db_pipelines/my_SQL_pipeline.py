from api.Models.model_db import DatabaseConnection
from nfs.src.db.db_connectors.my_sql_connectors import connect_mysql_db, connect_mysql_server
from nfs.src.db.db_handlers.fetch_db_meta import get_mysql_connection
from nfs.src.db.db_handlers.my_SQL_handler import execute_query
from nfs.src.db.db_schemas.create_db_schema import create_database_query
from nfs.src.db.db_schemas.create_purchase_schema import CREATE_NFECOMPRA_TABLE
from nfs.src.db.db_schemas.create_sale_schema import CREATE_NFEVENDA_TABLE
from nfs.src.db.db_schemas.create_cod_schema import CREATE_COD_TABLE



def mysql_pipeline(id):
    server_conn = None
    db_conn = None
    db_name = None

    try:
        # Recupera status do banco
        db_obj = DatabaseConnection.objects.get(id=id)

        # GUARD: não roda se já foi criado
        if db_obj.is_created:
            return "Pipeline já foi executada. Banco de Dados já criado."

        # Recupera metadados
        db_data = get_mysql_connection(id)
        hostname = db_data['hostname']
        username = db_data['username']
        password = db_data['password']
        db_name = db_data['db_name']
        port = int(db_data['port'])

        # 1. Conecta ao servidor
        server_conn = connect_mysql_server(hostname, username, password, port)

        # 2. Cria banco
        execute_query(
            server_conn,
            f"CREATE DATABASE IF NOT EXISTS `{db_name}`",
            fetch_results=False
        )
        server_conn.commit()

        # 3. Conecta ao banco
        db_conn = connect_mysql_db(hostname, username, password, db_name, port)
        db_conn.autocommit = False

        # 4. Cria tabelas
        execute_query(db_conn, CREATE_NFECOMPRA_TABLE, fetch_results=False)
        execute_query(db_conn, CREATE_NFEVENDA_TABLE, fetch_results=False)
        execute_query(db_conn, CREATE_COD_TABLE, fetch_results=False)

        # 5. Commit final
        db_conn.commit()

        # 6. Atualiza flag
        db_obj.is_created = True
        db_obj.save(update_fields=["is_created"])

        msg = "Banco criado com sucesso!"

    except Exception as e:
       
        if server_conn and db_name:
            try:
                execute_query(
                    server_conn,
                    f"DROP DATABASE IF EXISTS `{db_name}`",
                    fetch_results=False
                )
                server_conn.commit()
            except Exception as drop_err:
                return f"Critical: DB creation failed and DROP failed: {drop_err}"

        msg = f"Pipeline failed. Database rolled back. Error: {e}"

    finally:
        if db_conn and db_conn.is_connected():
            db_conn.close()
        if server_conn and server_conn.is_connected():
            server_conn.close()

        return msg

