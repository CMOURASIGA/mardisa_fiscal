import { createFileRoute } from "@tanstack/react-router";
import { requireAdmin } from "@/routes/guards";
import ReadOnlyCatalog from "@/components/ReadOnlyCatalog";

export const Route = createFileRoute("/private/TableUser")({
  beforeLoad: requireAdmin,
  component: () => <ReadOnlyCatalog title="Usuários cadastrados" description="Lista de usuários do banco de gestão, para conferência. Nenhuma conta pode ser alterada nesta tela."
    path="/user" columns={[{"key":"id","label":"ID"},{"key":"username","label":"Usuário"},{"key":"first_name","label":"Nome"},{"key":"last_name","label":"Sobrenome"},{"key":"email","label":"E-mail"},{"key":"is_active","label":"Ativo"}]} />,
});
