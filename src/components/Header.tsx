import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";

export default function Header() {
  const navigate = useNavigate();
  let user: { username?: string; first_name?: string; last_name?: string; email?: string; role?: string } | null = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch { /* sessão inválida */ }
  const userLabel = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "Usuário";
  const initials = userLabel.slice(0, 2).toUpperCase();
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("selected_enterprise_id");
    navigate({ to: "/auth/login" });
  };
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#e6ebf0] bg-white">
      <div className="flex h-[72px] items-center justify-between gap-4 px-5 lg:px-8">
        <div className="ml-12 flex items-center gap-3 lg:ml-0">
          <img src="/logo-7c.svg" alt="7C Software" className="h-8 w-8 rounded-lg lg:hidden" />
          <div className="min-w-0">
            <span className="block text-xs font-bold uppercase tracking-widest text-[#eb5c00]">7C SOFTWARE</span>
            <span className="block text-sm font-semibold text-[#17202a]">Fiscal ST</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex h-11 items-center gap-3 rounded-xl px-2 text-[#17202a]">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-[#17202a] text-xs text-white">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <span className="block text-xs font-semibold">{userLabel}</span>
                <span className="block text-[11px] text-[#64748b]">{user?.role || "Usuário"}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>
              <span className="block text-sm">{userLabel}</span>
              <span className="block text-xs font-normal text-muted-foreground">{user?.email || user?.username}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" /> Sair do sistema
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
