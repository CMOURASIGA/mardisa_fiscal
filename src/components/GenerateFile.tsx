import { useState } from "react";
import { Download, FileDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSelectedEnterprise } from "@/hooks/useSelectedEnterprise";
import EnterpriseBanner from "@/components/EnterpriseBanner";

type LocalSimulation = {
  enterpriseId: number | null;
  type: "compra" | "venda";
  at: string;
  results: Array<{ name: string; valid: boolean; detail: string; number?: string; issuer?: string; amount?: string }>;
};
const key = "fiscal-st:simulacao-v1";

export default function FileDownloadPage() {
  const { enterpriseId, enterprise, loading } = useSelectedEnterprise();
  const [message, setMessage] = useState("");
  function downloadLocalSummary() {
    setMessage("");
    try {
      const raw = localStorage.getItem(key);
      if (!raw) throw new Error("Não há simulação local salva. Execute primeiro uma análise XML.");
      const payload = JSON.parse(raw) as LocalSimulation;
      if (payload.enterpriseId !== enterpriseId) throw new Error("A simulação pertence a outro contexto de empresa. Faça a análise novamente.");
      // Este relatório descreve somente o resultado do navegador. Não é documento fiscal válido.
      const report = {
        titulo: "Fiscal ST | Resultado da simulação local",
        origem: "localStorage - não é apuração fiscal nem exportação oficial",
        empresa: enterprise?.razao_social || "",
        ...payload,
      };
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fiscal-st-simulacao-local.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("Relatório local baixado. Nenhum processamento foi solicitado ao backend.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Não foi possível exportar o resumo local.");
    }
  }
  return <div className="space-y-6">
    <div><p className="text-sm font-semibold text-primary">Fiscal ST / Demonstração operacional</p>
      <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold"><FileDown className="h-7 w-7 text-primary" /> Exportação de resultados</h1>
      <p className="mt-2 text-muted-foreground">Conheça o fluxo de exportação sem acionar rotinas fiscais do backend.</p>
    </div>
    <div className="rounded-xl border border-[#eb5c00]/30 bg-[#fff4eb] p-5 text-sm text-[#813600]">
      <p className="flex items-center gap-2 font-bold"><ShieldCheck className="h-5 w-5" /> MODO DEMONSTRAÇÃO, SEM ESCRITA</p>
      <p className="mt-2">Por segurança, as rotinas originais de geração de ZIP/XML permanecem desativadas nesta interface até que seus efeitos sejam auditados. O arquivo abaixo é um resumo JSON da simulação armazenada no seu navegador, não um documento fiscal oficial.</p>
    </div>
    <Card><CardHeader><CardTitle>Resumo da simulação local</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <EnterpriseBanner enterprise={enterprise} loading={loading} />
        <p className="text-sm text-muted-foreground">Exporte os dados básicos da análise XML executada no navegador para apresentar à equipe técnica.</p>
        <Button onClick={downloadLocalSummary} ><Download className="mr-2 h-4 w-4" /> Baixar resumo local (JSON)</Button>
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
      </CardContent></Card>
  </div>;
}
