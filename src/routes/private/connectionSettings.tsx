import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type Dispatch, type SetStateAction, type FormEvent } from "react";
import { requireAdmin } from "@/routes/guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/private/connectionSettings")({
  beforeLoad: requireAdmin, component: Page,
});
type Fields = { DB_HOST: string; DB_PORT: string; DB_NAME: string; DB_USER: string; DB_PASSWORD: string };
type Company = { id: number; razao_social: string; CNPJ?: string };
const empty: Fields = { DB_HOST: "", DB_PORT: "3306", DB_NAME: "", DB_USER: "", DB_PASSWORD: "" };
const origin = (import.meta.env.VITE_API_URL_LOGIN || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000")
  .replace(/\/$/, "").replace(/\/api\/v1$/, "");
async function request(path: string, method: "GET" | "POST" = "GET", body?: object) {
  const response = await fetch(origin + path, {
    method,
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + localStorage.getItem("accessToken") },
    cache: "no-store",
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Não foi possível completar a operação.");
  return data;
}
function Inputs({ value, onChange, saved }: {
  value: Fields; onChange: (field: keyof Fields, val: string) => void; saved: boolean;
}) {
  return <div className="space-y-3">
    {([["DB_HOST","Servidor"],["DB_PORT","Porta"],["DB_NAME","Banco"],["DB_USER","Usuário de leitura"],["DB_PASSWORD","Senha"]] as const).map(([field,label]) =>
      <label key={field} className="block text-sm font-semibold">{label}
        <Input className="mt-2" type={field==="DB_PASSWORD"?"password":"text"}
          autoComplete="off" required={field!=="DB_PASSWORD" || !saved}
          placeholder={field==="DB_PASSWORD" && saved?"Deixe vazio para manter a senha local":""}
          value={value[field]} onChange={e=>onChange(field,e.target.value)}/>
      </label>)}
  </div>;
}
function Page() {
  const [meta,setMeta] = useState<Fields>(empty);
  const [metaSaved,setMetaSaved] = useState(false);
  const [companies,setCompanies] = useState<Company[]>([]);
  const [selected,setSelected] = useState("");
  const [fiscal,setFiscal] = useState<Fields>(empty);
  const [fiscalSaved,setFiscalSaved] = useState(false);
  const [result,setResult] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [loadingCompanies,setLoadingCompanies] = useState(false);
  const [ready,setReady] = useState(false);

  const loadCompanies = async () => {
    setLoadingCompanies(true); setError("");
    try {
      const data = await request("/local-data/enterprises/");
      setCompanies(Array.isArray(data.data)? data.data : []);
      window.dispatchEvent(new Event("fiscal-enterprises-updated"));
    } catch(e) { setError(e instanceof Error ? e.message : "Falha na consulta."); }
    finally { setLoadingCompanies(false); }
  };
  useEffect(() => {
    let active=true;
    request("/local-admin/readonly-config/").then(data=>{
      if (!active) return;
      setMeta({ DB_HOST:data.host || "",DB_PORT:data.port || "3306",DB_NAME:data.database || "",DB_USER:data.username || "",DB_PASSWORD:"" });
      setMetaSaved(Boolean(data.password_saved)); setReady(Boolean(data.configured));
      if(data.configured) void loadCompanies();
    }).catch(e=>{if(active) setError(e.message);});
    return ()=>{active=false;};
  }, []);
  useEffect(() => {
    if (!selected) {setFiscal(empty);setFiscalSaved(false);return;}
    let active = true;
    request("/local-admin/tenant/" + selected + "/").then(data=>{
      if (!active) return;
      setFiscal({ DB_HOST:data.host || "", DB_PORT:data.port || "3306",DB_NAME:data.database || "",DB_USER:data.username || "",DB_PASSWORD:"" });
      setFiscalSaved(Boolean(data.password_saved));
    }).catch(e=>{if(active)setError(e.message);});
    return ()=>{active=false;};
  }, [selected]);
  const change = (setter: Dispatch<SetStateAction<Fields>>) => (field: keyof Fields, val:string) => setter(prev=>({...prev,[field]:val}));
  async function save(event:FormEvent, type:"meta"|"fiscal") {
    event.preventDefault();setBusy(true);setResult("");setError("");
    try {
      const data=type==="meta" ?
        await request("/local-admin/readonly-config/","POST",{...meta, ENGINE:"mysql"}) :
        await request("/local-admin/tenant/"+selected+"/","POST",fiscal);
      setResult(data.message || "Conexão validada e salva somente neste backend.");
      if(type==="meta"){setMetaSaved(true);setMeta(p=>({...p,DB_PASSWORD:""}));setReady(true);await loadCompanies();}
      else {setFiscalSaved(true);setFiscal(p=>({...p,DB_PASSWORD:""}));}
    } catch(e){setError(e instanceof Error?e.message:"Falha na configuração.");}
    finally{setBusy(false);}
  }
  return <div className="mx-auto max-w-3xl space-y-6">
    <header>
      <p className="text-sm font-semibold text-primary">Fiscal ST / Administração técnica local</p>
      <h1 className="mt-2 text-3xl font-bold">Conexões de leitura</h1>
      <p className="mt-2 text-sm text-muted-foreground">Acesso reservado ao desenvolvedor. Somente credenciais com privilégio SELECT são aceitas.</p>
    </header>
    <div className="rounded-xl border border-[#f2c39e] bg-[#fff5ec] p-4 text-sm text-[#853c11]">
      O Django local guarda as configurações em arquivos ignorados pelo Git, contendo senhas em texto puro. Proteja as ACLs do Windows e nunca publique nem compartilhe esses arquivos. Não há gravação no MySQL.
    </div>
    <Card><CardHeader><CardTitle>1. Banco de gestão: lista das empresas</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">Informe o servidor de gestão existente que possui a tabela de empresas. O teste executa SELECT e verifica os privilégios.</p>
        <form className="space-y-4" onSubmit={e=>void save(e,"meta")}>
          <Inputs value={meta} onChange={change(setMeta)} saved={metaSaved}/>
          <Button disabled={busy} type="submit">{busy?"Testando...":"Testar e salvar banco de gestão"}</Button>
        </form>
        {ready && <Button variant="outline" disabled={loadingCompanies} onClick={()=>void loadCompanies()}>
          {loadingCompanies?"Consultando empresas...":"Atualizar empresas do banco de gestão"}
        </Button>}
      </CardContent>
    </Card>
    <Card><CardHeader><CardTitle>2. Banco fiscal por empresa</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">O legado associa bancos fiscais individuais às empresas. Para evitar reutilizar senhas criptografadas do ambiente oficial, configure aqui uma conta exclusivamente SELECT no banco fiscal da empresa selecionada.</p>
        <label className="block text-sm font-semibold">Empresa
          <select className="mt-2 h-10 w-full rounded-lg border bg-white px-3" value={selected} onChange={e=>setSelected(e.target.value)}>
            <option value="">Selecione uma empresa consultada</option>
            {companies.map(company=><option value={company.id} key={company.id}>{company.razao_social} (ID {company.id})</option>)}
          </select>
        </label>
        {!companies.length && <p className="text-sm text-muted-foreground">As empresas aparecerão depois de validar e consultar o banco de gestão.</p>}
        {selected && <form className="space-y-4" onSubmit={e=>void save(e,"fiscal")}>
          <Inputs value={fiscal} onChange={change(setFiscal)} saved={fiscalSaved}/>
          <Button type="submit" disabled={busy}>{busy?"Testando...":"Testar e vincular banco fiscal (somente leitura)"}</Button>
        </form>}
      </CardContent>
    </Card>
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {result && <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{result}</p>}
    <p className="text-sm text-muted-foreground">Depois de configurar os bancos, acesse Visão geral ou Notas de compra/venda. Os dados são consultados no MySQL; importações XML continuam apenas no navegador.</p>
  </div>;
}
