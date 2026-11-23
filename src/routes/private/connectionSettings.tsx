import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { requireAdmin } from "@/routes/guards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/private/connectionSettings")({ beforeLoad: requireAdmin, component: Page });

function Page() {
  const [form, setForm] = useState({ ENGINE:"mysql", DB_HOST:"", DB_PORT:"3306", DB_NAME:"", DB_USER:"", DB_PASSWORD:"" });
  const [result,setResult] = useState("");
  const [busy,setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setResult("");
    try {
      const base = (import.meta.env.VITE_API_URL_LOGIN || "http://127.0.0.1:8000").replace(/\/$/,"").replace(/\/api\/v1$/,"");
      const response = await fetch(base + "/local-admin/readonly-config/", {
        method:"POST",
        headers: { "Content-Type":"application/json", Authorization:"Bearer " + localStorage.getItem("accessToken") },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      setResult(response.ok ? data.message : data.detail);
      if (response.ok) setForm(old=>({...old,DB_PASSWORD:""}));
    } catch { setResult("Servidor de configuração indisponível."); }
    finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-2xl space-y-5">
    <h1 className="text-3xl font-bold">Administração técnica / Conexão de leitura</h1>
    <p className="text-sm text-muted-foreground">Acesso exclusivo ao desenvolvedor. As credenciais são enviadas ao Django local e nunca salvas no localStorage do navegador.</p>
    <p className="rounded-lg border p-4 text-sm">Informe somente credenciais MySQL com privilégio SELECT. Esta configuração não habilita automaticamente as consultas fiscais e não modifica o banco oficial.</p>
    <form onSubmit={submit} className="space-y-3 rounded-xl border bg-white p-5">
      {([["DB_HOST","Servidor"],["DB_PORT","Porta"],["DB_NAME","Banco"],["DB_USER","Usuário de leitura"],["DB_PASSWORD","Senha"]] as const).map(([key,label])=><label key={key} className="block text-sm font-semibold">{label}
        <Input className="mt-2" type={key==="DB_PASSWORD"?"password":"text"} autoComplete="off" required={key!=="DB_PASSWORD"} value={form[key]} onChange={event=>setForm(old=>({...old,[key]:event.target.value}))} />
      </label>)}
      {result && <p role="status" className="rounded-lg bg-slate-100 p-3 text-sm">{result}</p>}
      <Button type="submit" disabled={busy}>{busy?"Testando...":"Testar acesso somente leitura e salvar localmente"}</Button>
    </form>
  </div>;
}
