import pandas as pd
import logging
import sys
from nfs.src.db.db_pipelines.db_connection_meta import connect_mysql_by_id

# ---------------- CONFIG ----------------
CSV_PATH = r"C:\Users\Mathe\Downloads\codsfinal.csv"



TABLE_NAME = "cod_table"
REQUIRED_COLUMNS = ["COD_INT", "UNIDADE_INT", "COD_SUP"]
# ---------------------------------------


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)


def validate_columns(df):
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")


def clean_row(row):
    return (
        str(row["COD_INT"]).strip(),
        str(row["UNIDADE_INT"]).strip(),
        str(row["COD_SUP"]).strip(),
    )


def import_csv_to_mysql_obs(id):
    try:
        logging.info("Reading CSV...")
        df = pd.read_csv(CSV_PATH)
        validate_columns(df)
    except Exception as e:
        logging.critical(f"CSV error: {e}")
        sys.exit(1)

    connection = None

    try:
        connection = connect_mysql_by_id(id)
        cursor = connection.cursor()

        insert_sql = f"""
            INSERT INTO {TABLE_NAME} (row_id, un, cod_sup)
            VALUES (%s, %s, %s)
        """

        success = 0
        duplicates = 0
        failed = 0

        for i, row in df.iterrows():
            try:
                data = clean_row(row)

                if not all(data):
                    failed += 1
                    continue

                result = cursor.execute(insert_sql, data)

                if result == 1:
                    success += 1
                else:
                    duplicates += 1

            except Exception as row_err:
                logging.error(f"Row {i} failed: {row_err}")
                failed += 1

        connection.commit()
        logging.info(
            f"Finished: {success} inserted, {duplicates} duplicates, {failed} failed"
        )

    except Exception as db_err:
        if connection:
            connection.rollback()
        logging.critical(f"Database error: {db_err}")

    finally:
        if connection:
            connection.close()



def import_csv_to_mysql(file_obj, id):
    """
    file_obj = InMemoryUploadedFile from request.FILES
    id = mysql connection id
    """

    try:
        logging.info("Reading CSV...")
        file_obj.seek(0)
        df = pd.read_csv(file_obj)
        validate_columns(df)
    except Exception as e:
        logging.critical(f"CSV error: {e}")
        return {"status": "error", "error": str(e)}

    connection = None

    try:
        connection = connect_mysql_by_id(id)
        cursor = connection.cursor()

        insert_sql = f"""
            INSERT INTO {TABLE_NAME} (row_id, un, cod_sup)
            VALUES (%s, %s, %s)
        """

        success = 0
        duplicates = 0
        failed = 0

        for i, row in df.iterrows():
            try:
                data = clean_row(row)

                if not all(data):
                    failed += 1
                    continue

                result = cursor.execute(insert_sql, data)

                if result == 1:
                    success += 1
                else:
                    duplicates += 1

            except Exception as row_err:
                logging.error(f"Row {i} failed: {row_err}")
                failed += 1

        connection.commit()

        return {
            "status": "ok",
            "inserted": success,
            "duplicates": duplicates,
            "failed": failed
        }

    except Exception as db_err:
        if connection:
            connection.rollback()
        logging.critical(f"Database error: {db_err}")
        return {"status": "error", "error": str(db_err)}

    finally:
        if connection:
            connection.close()


def delete_by_id(row_id, conn):
    sql = f'DELETE FROM {TABLE_NAME} WHERE id = %s'
    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, (row_id,))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def update_by_id(row_id, values: dict, conn):


    if not values:
        raise ValueError("No values to update")

    set_clause = ", ".join([f"{k} = %s" for k in values.keys()])
    sql = f"UPDATE {TABLE_NAME} SET {set_clause} WHERE id = %s"

    params = list(values.values()) + [row_id]

    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, params)
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def insert_row(values: dict, conn):

    cols = ", ".join(values.keys())
    placeholders = ", ".join(["%s"] * len(values))
    sql = f"INSERT INTO {TABLE_NAME} ({cols}) VALUES ({placeholders})"

    try:
        with conn.cursor() as cursor:
            cursor.execute(sql, list(values.values()))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


if __name__ == "__main__":
    import_csv_to_mysql()
