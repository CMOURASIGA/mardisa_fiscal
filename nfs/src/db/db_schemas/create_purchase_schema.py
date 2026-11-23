CREATE_NFECOMPRA_TABLE = """
CREATE TABLE IF NOT EXISTS nfecompra (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nProt VARCHAR(100),
    digVal VARCHAR(255),
    dhRecbto DATETIME,
    id_nf VARCHAR(100),
    chNFe VARCHAR(100),
    xMotivo VARCHAR(255),
    cStat VARCHAR(3),

    chassi VARCHAR(100),
    cProd VARCHAR(100),
    xProd VARCHAR(255),

    uCom VARCHAR(10),
    uTrib VARCHAR(50),
    ncm VARCHAR(10),
    cfop VARCHAR(10),

    qcom DECIMAL(20,4),

    modBC INT,
    modBCST INT,
    orig INT,

    pICMSST DECIMAL(5,4),
    pRedBC DECIMAL(5,4),
    pICMS DECIMAL(5,4),

    vICMSST DECIMAL(20,2),
    vBCST DECIMAL(20,2),
    vBC DECIMAL(20,2),
    vICMS DECIMAL(20,2),

    CST VARCHAR(3),

    emit_CNPJ VARCHAR(14),
    emit_xNome VARCHAR(255),

    CNPJ VARCHAR(14),
    xNome VARCHAR(255),

    nItem INT,
    natOp VARCHAR(100),

    is_generated TINYINT(1) NOT NULL DEFAULT 0,

    INDEX idx_dhRecbto (dhRecbto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    """
