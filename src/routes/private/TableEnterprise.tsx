import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/routes/guards";
import ReadOnlyCatalog from "@/components/ReadOnlyCatalog";

export const Route = createFileRoute("/private/TableEnterprise")({
  beforeLoad: requireAdmin,
  component: () => <ReadOnlyCatalog title="Empresas cadastradas" description="Cadastro existente no banco de gestão da Mardisa, consultado sem alterações."
    path="/enterprises" columns={[{"key":"id","label":"ID"},{"key":"razao_social","label":"Razão social"},{"key":"CNPJ","label":"CNPJ"}]} />,
});
