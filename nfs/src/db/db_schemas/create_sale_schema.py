CREATE_NFEVENDA_TABLE = """
    CREATE TABLE IF NOT EXISTS nfevenda (
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
    nItem INT,
    uTrib VARCHAR(50),
    ncm VARCHAR(10),
    cfop VARCHAR(10),

    vProd DECIMAL(20,2),
    pICMSEfet DECIMAL(20,2) DEFAULT 12,
    UF CHAR(2),
    INDEX idx_dhRecbto (dhRecbto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""

index = """  INDEX idx_nProt (nProt),
    INDEX idx_chNFe (chNFe) """