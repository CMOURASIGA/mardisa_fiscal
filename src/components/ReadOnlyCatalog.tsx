import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type RecordValue = string | number | boolean | null | undefined;
type CatalogRow = Record<string, RecordValue>;
export type CatalogColumn = { key: string; label: string };

export default function ReadOnlyCatalog({title,description,path,columns}:{
  title:string; description:string; path:string; columns:CatalogColumn[];
}) {
  const [rows,setRows]=useState<CatalogRow[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [query,setQuery]=useState("");
  const [reload,setReload]=useState(0);
  useEffect(()=>{
    let active=true;
    setLoading(true);setError("");
    api.get(path).then(response=>{
      if(!active)return;
      setRows(Array.isArray(response.data.data)?response.data.data:[]);
    }).catch(e=>{
      if(!active)return;
      setRows([]);
      setError(e?.response?.data?.detail || e?.message || "Consulta indisponível.");
    }).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[path,reload]);
  const filtered=useMemo(()=>rows.filter(row=>
    columns.some(column=>String(row[column.key]??"").toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")))
  ),[rows,query,columns]);
  return <div className="space-y-6">
    <header>
      <p className="text-sm font-semibold text-primary">Fiscal ST / Consulta real</p>
      <h1 className="mt-2 text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </header>
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Input className="max-w-md" placeholder="Pesquisar registros..." value={query} onChange={e=>setQuery(e.target.value)} />
        <Button variant="outline" onClick={()=>setReload(n=>n+1)}>Atualizar consulta</Button>
      </div>
      {loading && <p role="status" className="py-6 text-sm text-muted-foreground">Consultando dados pelo backend...</p>}
      {error && <p role="alert" className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}
      {!loading && !error && filtered.length===0 && <p className="py-6 text-sm text-muted-foreground">Nenhum registro correspondente à pesquisa.</p>}
      {!loading && !error && filtered.length>0 && <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b bg-slate-50">{columns.map(col=><th key={col.key} className="whitespace-nowrap px-4 py-3 font-semibold">{col.label}</th>)}</tr></thead>
          <tbody>{filtered.map((row,i)=><tr key={String(row.id??i)} className="border-b last:border-0">
            {columns.map(col=><td key={col.key} className="max-w-sm break-words px-4 py-3">{String(row[col.key]??"Não informado")}</td>)}
          </tr>)}</tbody>
        </table>
      </div>}
      <p className="mt-4 text-xs text-muted-foreground">Registros consultados: {error?"indisponíveis":rows.length}. Somente leitura, sem inclusão, alteração ou exclusão.</p>
    </div>
  </div>;
}
