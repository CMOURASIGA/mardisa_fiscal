CREATE_COD_TABLE = """
CREATE TABLE IF NOT EXISTS cod_table (
    id INT NOT NULL AUTO_INCREMENT,
    cod_sup VARCHAR(45),
    cod_int VARCHAR(45),
    un VARCHAR(15),

    PRIMARY KEY (id),
    INDEX idx_cod_sup (cod_sup)
);
"""