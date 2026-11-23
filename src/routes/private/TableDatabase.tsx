import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/routes/guards";
import ReadOnlyCatalog from "@/components/ReadOnlyCatalog";

export const Route = createFileRoute("/private/TableDatabase")({
  beforeLoad: requireAdmin,
  component: () => <ReadOnlyCatalog title="Conexões cadastradas" description="Metadados de conexão da versão existente. Senhas e segredos não são exibidos. O vínculo de leitura é configurado na Administração técnica."
    path="/databases" columns={[{"key":"id","label":"ID"},{"key":"enterprise_id_id","label":"Empresa ID"},{"key":"db_name","label":"Banco"},{"key":"hostname","label":"Servidor"},{"key":"port","label":"Porta"},{"key":"username","label":"Usuário"},{"key":"db_type","label":"Tipo"}]} />,
});
