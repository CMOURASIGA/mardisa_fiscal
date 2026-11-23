import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, UserRoundPen } from "lucide-react";

/** Sessão de autenticação pertence somente ao usuário atual. */
export default function Header() {
  let user: { username?: string; first_name?: string; last_name?: string; role?: string } | null = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch { /* sessão inválida */ }
  const userLabel = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Usuário";
  const initials = userLabel.slice(0, 2).toUpperCase();

  function endSession() {
    // A simulação local também é descartada ao trocar de usuário para evitar
    // exposição de metadados fiscais a outra sessão no mesmo navegador.
    // A seleção da empresa é removida para não herdar o contexto de outro usuário.
    for (const key of ["accessToken", "refreshToken", "access", "refresh", "user", "selected_enterprise_id", "fiscal-st:simulacao-v1"]) {
      localStorage.removeItem(key);
    }
    window.location.replace("/auth/login");
  }

  return <header className="sticky top-0 z-30 w-full border-b border-[#e6ebf0] bg-white">
    <div className="flex h-[72px] items-center justify-between gap-4 px-5 lg:px-8">
      <div className="ml-12 flex items-center gap-3 lg:ml-0">
        <img src="/logo-7c.svg" alt="7C Consulting" className="h-8 w-8 rounded-lg lg:hidden" />
        <div className="min-w-0">
          <span className="block text-xs font-bold uppercase tracking-widest text-[#eb5c00]">7C CONSULTING</span>
          <span className="block text-sm font-semibold text-[#17202a]">Fiscal ST</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="mr-1 hidden items-center gap-2 sm:flex">
          <Avatar className="h-9 w-9"><AvatarFallback className="bg-[#17202a] text-xs text-white">{initials}</AvatarFallback></Avatar>
          <div className="hidden text-left md:block">
            <span className="block text-xs font-semibold">{userLabel}</span>
            <span className="block text-[11px] text-[#64748b]">{user?.role || "Usuário"}</span>
          </div>
        </div>
        <Button type="button" variant="outline" size="sm" className="gap-2" onClick={endSession} title="Encerrar sessão e entrar com outra conta">
          <UserRoundPen className="h-4 w-4" /> <span className="hidden sm:inline">Trocar usuário</span>
        </Button>
        <Button type="button" variant="ghost" size="sm" className="gap-2 text-[#9a3412]" onClick={endSession} title="Sair do Fiscal ST">
          <LogOut className="h-4 w-4" /> <span className="hidden md:inline">Sair</span>
        </Button>
      </div>
    </div>
  </header>;
}
