import React from "react";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useEnterprise } from "@/context/EnterpriseContext";
import { useEnterpriseList } from "@/hooks/useSelectedEnterprise";
import { cn } from "@/lib/utils";

interface Props {
  minimized: boolean;
}

const EnterpriseSelector: React.FC<Props> = ({ minimized }) => {
  const { enterprises, loading, error } = useEnterpriseList();
  const { selectedEnterprise, setSelectedEnterprise } = useEnterprise();

  const selected = enterprises.find((ent) => ent.id === selectedEnterprise);

  if (loading) {
    return <Skeleton className="h-8 w-full" />;
  }

  return (
    <Select
      value={selected ? String(selected.id) : undefined}
      onValueChange={(value) => setSelectedEnterprise(Number(value))}
    >
      <SelectTrigger
        size="sm"
        title={minimized ? selected?.razao_social ?? "Selecione a Empresa" : undefined}
        className={cn(
          "w-full",
          minimized && "justify-center px-2 [&_svg:last-child]:hidden"
        )}
      >
        <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        {!minimized && <SelectValue placeholder="Selecione a Empresa" />}
      </SelectTrigger>

      <SelectContent className="max-h-60">
        {error && (
          <div className="px-2 py-1.5 text-sm text-destructive">
            Erro ao carregar empresas
          </div>
        )}
        {!error && enterprises.length === 0 && (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            Nenhuma empresa encontrada
          </div>
        )}
        {enterprises.map((ent) => (
          <SelectItem key={ent.id} value={String(ent.id)} className="truncate">
            {ent.razao_social}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default EnterpriseSelector;
