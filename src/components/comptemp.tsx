import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';

const MyDataTable = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); 
  const [perPage, setPerPage] = useState(10); 
  const [, setTotalRows] = useState(0); 
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:8000/api/v1/fetch-report');
      const fetchedData = Array.isArray(response.data.data) ? response.data.data : [];
      setData(fetchedData);
      setTotalRows(fetchedData.length);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      name: 'Chave',
      selector: (row: any) => row.chNFe,
      sortable: true,
    },
    {
      name: 'Data',
      selector: (row: any) => {
        const date = new Date(row.dhRecbto);
        return date.toLocaleDateString('pt-BR');
      },
      sortable: true,
    },
    {
      name: 'chassi',
      selector: (row: any) => row.cProd,
      sortable: true,
    },
    {
      name: 'Valor do Imposto',
      selector: (row: any) => row.vBCST,
      sortable: true,
    },
    {
      name: 'Valor de Venda',
      selector: (row: any) => row.vProd,
      sortable: true,
    },
    {
      name: 'Desconto Projetado',
      selector: (row: any) => {
    
      if (row.vBCST != null && row.vProd != null) {
        return (row.vBCST - row.vProd).toFixed(2);
      } else {
        return 'N/A'; 
    }
  },
    sortable: true,
    }
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number, newPage: number) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); 
  };

  const filteredData = search
    ? data.filter(
        (row) =>
          row.xProd.toLowerCase().includes(search.toLowerCase()) ||
          row.chNFe.toLowerCase().includes(search.toLowerCase()) ||
          row.cProd.toLowerCase().includes(search.toLowerCase())
      )
    : data;

  
  const dataWithUniqueKey = filteredData.map((row) => ({
    ...row,
    key: row.id, 
  }));

  
  const dataToDisplay = dataWithUniqueKey.slice((page - 1) * perPage, page * perPage);
  void dataToDisplay; // mantido para a paginação futura

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Tabela de Vendas</h1>
      <div className="flex justify-end mb-4">
        <input
          type="text"
          className="border p-2 rounded"
          placeholder="Buscar..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      <DataTable
        keyField="key"
        title="Vendas"
        columns={columns}
        data={filteredData}  
        pagination
        paginationPerPage={perPage}
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handlePerPageChange}
        progressPending={loading}
        highlightOnHover
        pointerOnHover
        paginationTotalRows={filteredData.length}  
      />
    </div>
  );
};

export default MyDataTable;
