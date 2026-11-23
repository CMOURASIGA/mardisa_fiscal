import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnterprise } from "@/context/EnterpriseContext";
import { requireAuth } from "@/routes/guards";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { ShoppingCart, Receipt, FileText, Upload, Download, RefreshCw, AlertCircle, Building2, Users } from "lucide-react";

export const Route = createFileRoute("/private/home")({
  beforeLoad: requireAuth,
  component: Dashboard,
});

function Dashboard() {
  const { selectedEnterprise } = useEnterprise();
  const [refreshKey, setRefreshKey] = useState(0);
  const { counts, status, errors } = useDashboardStats(selectedEnterprise, refreshKey);
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  })();
  const isAdmin = user?.role === "admin" || user?.role === "admin-local";
  const name = user?.first_name || user?.username || "usuário";
  const stats = [
    { title: "Notas de compra", value: counts.compras, icon: ShoppingCart, href: "/private/TablePurchase" },
    { title: "Notas de venda", value: counts.vendas, icon: Receipt, href: "/private/TableSale" },
    { title: "Registros do relatório", value: counts.relatorios, icon: FileText, href: "/private/TableReport" },
  ] as const;

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">Mardisa Fiscal | Visão operacional</p>
          <h1 className="text-3xl font-bold tracking-tight">Visão geral</h1>
          <p className="text-muted-foreground">Olá, {name}. Acompanhe os registros fiscais da empresa selecionada.</p>
        </div>
        <Button variant="outline" onClick={() => setRefreshKey((k) => k + 1)} disabled={!selectedEnterprise || status === "loading"}>
          <RefreshCw className="mr-2 h-4 w-4" /> Atualizar dados
        </Button>
      </header>

      {!selectedEnterprise && (
        <div role="status" className="rounded-xl border border-border bg-muted/50 p-5">
          <div className="flex items-center gap-2 font-semibold"><Building2 className="h-5 w-5" /> Selecione uma empresa</div>
          <p className="mt-2 text-sm text-muted-foreground">Use o seletor do menu lateral para consultar os dados reais dessa empresa.</p>
        </div>
      )}
      {status === "error" && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 font-semibold"><AlertCircle className="h-5 w-5" /> Consulta parcialmente indisponível</div>
          <p className="mt-1 text-sm">Não foi possível consultar: {errors.join(", ")}. Os números não são substituídos por zeros fictícios. Confira a API, autenticação e conexão do banco da empresa.</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ title, value, icon: Icon, href }) => (
          <Card key={title} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
              <Icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              {status === "loading" ? <Skeleton className="h-9 w-24" /> : (
                <p className="text-3xl font-bold" aria-label={value === null ? "Indisponível" : String(value)}>{value === null ? "—" : value.toLocaleString("pt-BR")}</p>
              )}
              <p className="mt-2 text-xs text-muted-foreground">Total retornado pela API para a empresa atual</p>
              <Button className="mt-4 w-full" variant="outline" asChild><Link to={href}>Consultar registros</Link></Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Importar XML fiscal</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Importe documentos de compra e venda na empresa selecionada.</p>
            <Button asChild className="w-full"><Link to="/private/uploadFile"><Upload className="mr-2 h-4 w-4" /> Importar arquivos</Link></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Gerar arquivos fiscais</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Gere os arquivos disponibilizados pelas rotinas atuais do backend.</p>
            <Button asChild variant="outline" className="w-full"><Link to="/private/generateFile"><Download className="mr-2 h-4 w-4" /> Gerar arquivos</Link></Button>
          </CardContent>
        </Card>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader><CardTitle className="text-base">Administração</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link to="/private/TableUser"><Users className="mr-2 h-4 w-4" /> Usuários</Link></Button>
            <Button asChild variant="outline"><Link to="/private/TableEnterprise"><Building2 className="mr-2 h-4 w-4" /> Empresas</Link></Button>
          </CardContent>
        </Card>
      )}
      <p className="text-xs text-muted-foreground">Indicadores de arquivos processados e tendências mensais serão exibidos somente após a disponibilização de dados verificáveis no backend.</p>
    </div>
  );
}
