import { AlertTriangle, Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Enterprise } from "@/hooks/useSelectedEnterprise";

interface EnterpriseBannerProps {
  enterprise: Enterprise | null;
  loading?: boolean;
  className?: string;
}

/**
 * Cabeçalho de contexto da página: mostra a empresa ativa ou o aviso
 * de que nenhuma foi selecionada. Usado por Upload e Generate.
 */
const EnterpriseBanner = ({
  enterprise,
  loading = false,
  className,
}: EnterpriseBannerProps) => {
  if (loading) {
    return <Skeleton className={cn("h-9 w-full", className)} />;
  }

  if (!enterprise) {
    return (
      <div
        role="status"
        className={cn(
          "flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
          className
        )}
      >
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Nenhuma empresa selecionada</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm",
        className
      )}
    >
      <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate font-medium">{enterprise.razao_social}</span>
    </div>
  );
};

export default EnterpriseBanner;
