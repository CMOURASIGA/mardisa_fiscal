import { useEffect, useRef, useState } from "react";
import { AlertCircle, FileText, FileUp, ShieldCheck, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelectedEnterprise } from "@/hooks/useSelectedEnterprise";
import EnterpriseBanner from "@/components/EnterpriseBanner";

type InvoiceType = "compra" | "venda";
type Result = {
  name: string; valid: boolean; detail: string;
  number?: string; issuer?: string; amount?: string;
};
type Simulation = { enterpriseId: number | null; type: InvoiceType; at: string; results: Result[] };
const storageKey = "fiscal-st:simulacao-v1";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 100;

const readTag = (root: Document, tag: string): string =>
  root.getElementsByTagName(tag)[0]?.textContent?.trim() || "";

async function inspect(file: File): Promise<Result> {
  if (!file.name.toLowerCase().endsWith(".xml")) return { name: file.name, valid: false, detail: "Extensão inválida" };
  if (file.size > MAX_FILE_SIZE) return { name: file.name, valid: false, detail: "Arquivo excede 5 MB" };
  try {
    const raw = await file.text();
    if (/<!DOCTYPE|<!ENTITY/i.test(raw)) return { name: file.name, valid: false, detail: "XML com declaração DTD/entidade não permitido" };
    const doc = new DOMParser().parseFromString(raw, "application/xml");
    if (doc.querySelector("parsererror")) return { name: file.name, valid: false, detail: "XML malformado" };
    const isNfe = doc.getElementsByTagName("NFe").length > 0 || doc.getElementsByTagName("nfeProc").length > 0;
    if (!isNfe) return { name: file.name, valid: false, detail: "Documento não identificado como NF-e" };
    return {
      name: file.name, valid: true, detail: "Estrutura básica de NF-e reconhecida, sem validação fiscal completa",
      number: readTag(doc, "nNF"), issuer: readTag(doc, "xNome"), amount: readTag(doc, "vNF"),
    };
  } catch {
    return { name: file.name, valid: false, detail: "Não foi possível ler o arquivo" };
  }
}

export default function FileUploadPage() {
  const { enterpriseId, enterprise, loading } = useSelectedEnterprise();
  const [kind, setKind] = useState<InvoiceType>("compra");
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setFiles([]); setResults([]); setMessage("");
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const simulation = JSON.parse(saved) as Simulation;
        if (simulation.enterpriseId === enterpriseId) {
          setKind(simulation.type);
          setResults(simulation.results);
        }
      }
    } catch { setMessage("Histórico local indisponível."); }
  }, [enterpriseId]);

  function addFiles(items: FileList | null) {
    if (!items) return;
    const list = [...files, ...Array.from(items)].slice(0, MAX_FILES);
    setFiles(list); setResults([]); setMessage("");
  }

  async function simulate() {
    if (!files.length) return setMessage("Selecione pelo menos um XML.");
    setProcessing(true); setMessage("");
    try {
      const inspected = await Promise.all(files.map(inspect));
      const simulation: Simulation = {
        enterpriseId, type: kind, at: new Date().toISOString(),
        results: inspected,
      };
      // Apenas metadados e resultados mínimos, nunca XML bruto nem documento completo.
      localStorage.setItem(storageKey, JSON.stringify(simulation));
      setResults(inspected);
      setFiles([]);
    } catch {
      setMessage("Não foi possível salvar os resultados locais. Verifique o espaço do navegador.");
    } finally { setProcessing(false); }
  }

  function clearSimulation() {
    localStorage.removeItem(storageKey); setFiles([]); setResults([]); setMessage("");
  }

  return <div className="space-y-6">
    <div>
      <p className="text-sm font-semibold text-primary">Fiscal ST / Laboratório local</p>
      <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold"><FileUp className="h-7 w-7 text-primary" /> Simular importação de XML</h1>
      <p className="mt-2 text-muted-foreground">Experimente o fluxo de importação sem modificar os dados da Mardisa.</p>
    </div>
    <div role="status" className="rounded-xl border border-[#eb5c00]/30 bg-[#fff4eb] p-5 text-sm text-[#813600]">
      <div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5" /> SIMULAÇÃO LOCAL, SEM GRAVAÇÃO NO BANCO</div>
      <p className="mt-2">Os XMLs são analisados neste navegador. Apenas um resumo da simulação é salvo no localStorage deste dispositivo. Nenhum arquivo é enviado à API, e nenhum registro é criado no banco oficial.</p>
      <p className="mt-2">Esta análise identifica somente campos básicos do XML. Não substitui a validação tributária ou a importação original.</p>
    </div>
    <Card>
      <CardHeader><CardTitle>Documentos para análise</CardTitle></CardHeader>
      <CardContent className="space-y-5">
        <EnterpriseBanner enterprise={enterprise} loading={loading} />
        {!enterpriseId && <p className="rounded-lg bg-[#f1f5f9] p-3 text-sm text-[#475569]">Sem empresa selecionada. Você pode simular um XML localmente, mas esse resultado não será associado a uma empresa oficial.</p>}
        <div className="flex gap-2">
          <Button type="button" variant={kind === "compra" ? "default" : "outline"} onClick={() => setKind("compra")}>Compra</Button>
          <Button type="button" variant={kind === "venda" ? "default" : "outline"} onClick={() => setKind("venda")}>Venda</Button>
        </div>
        <div className="rounded-xl border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc] p-7 text-center">
          <Upload className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-sm">Selecione até {MAX_FILES} arquivos XML de até 5 MB cada.</p>
          <Button className="mt-4" variant="outline" type="button" onClick={() => fileInput.current?.click()}>Escolher arquivos</Button>
          <input ref={fileInput} type="file" accept=".xml,application/xml,text/xml" multiple className="hidden" onChange={e => { addFiles(e.target.files); e.target.value = ""; }} />
        </div>
        {files.length > 0 && <p className="text-sm">{files.length} arquivo(s) selecionado(s).</p>}
        <Button className="w-full" type="button" onClick={simulate} disabled={processing || files.length === 0}>{processing ? "Analisando localmente..." : "Executar simulação local"}</Button>
        {message && <p role="alert" className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> {message}</p>}
      </CardContent>
    </Card>
    {results.length > 0 && <Card>
      <CardHeader><CardTitle>Resultados armazenados neste navegador</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 text-sm"><span>Total: {results.length}</span><span>Estrutura reconhecida: {results.filter(v => v.valid).length}</span><span>Não reconhecidos: {results.filter(v => !v.valid).length}</span></div>
        <div className="max-h-96 space-y-2 overflow-auto">{results.map((result, i) => <div key={i} className="rounded-lg border p-3 text-sm">
          <div className="flex gap-2"><FileText className="h-4 w-4 shrink-0 text-primary" /><strong className="break-all">{result.name}</strong></div>
          <p className="mt-1 text-muted-foreground">{result.detail}</p>
          {result.valid && <p className="mt-1">NF-e: {result.number || "Não informado"} | Emitente: {result.issuer || "Não informado"} | Valor: {result.amount || "Não informado"}</p>}
        </div>)}</div>
        <Button variant="outline" type="button" onClick={clearSimulation}><Trash2 className="mr-2 h-4 w-4" /> Limpar simulação local</Button>
      </CardContent>
    </Card>}
  </div>;
}
