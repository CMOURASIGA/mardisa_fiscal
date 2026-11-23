import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState, type FormEvent } from "react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);
    try {
      const base = (import.meta.env.VITE_API_URL_LOGIN || import.meta.env.VITE_API_URL || "").replace(/\/$/, "").replace(/\/api\/v1$/, "");
      if (!base) throw new Error("API de autenticação não configurada. Defina VITE_API_URL_LOGIN no ambiente.");
      const response = await fetch(`${base}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.access || !data.user) {
        throw new Error(data.detail || data.message || "Usuário ou senha inválidos.");
      }
      localStorage.setItem("accessToken", data.access);
      if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate({ to: "/private/home" });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível entrar. Verifique a conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fiscal-login min-h-screen grid lg:grid-cols-[minmax(0,1.06fr)_minmax(420px,.94fr)]">
      <aside className="fiscal-login-brand hidden lg:flex flex-col justify-between p-12 xl:p-16">
        <div className="flex items-center gap-3">
          <img src="/logo-7c.svg" alt="7C Consulting" className="h-12 w-12 rounded-xl object-cover" />
          <div><strong className="block text-lg tracking-tight">7C Consulting</strong><span className="text-sm opacity-70">Soluções fiscais</span></div>
        </div>
        <div className="max-w-xl">
          <span className="fiscal-kicker">FISCAL ST</span>
          <h1 className="mt-6 text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.12]">Mais clareza para sua operação fiscal.</h1>
          <p className="mt-7 text-lg leading-relaxed text-slate-300">Importe notas fiscais, acompanhe compras e vendas e organize a geração de arquivos em um só ambiente.</p>
          <div className="mt-12 flex items-center gap-3 text-sm text-slate-300"><ShieldCheck size={20} className="text-orange-400" /> Acesso controlado por usuário e empresa</div>
        </div>
        <p className="text-xs text-slate-400">Fiscal ST · 7C Consulting</p>
      </aside>
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fa] p-6 sm:p-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-10 flex lg:hidden items-center gap-3">
            <img src="/logo-7c.svg" alt="7C Consulting" className="h-12 w-12 rounded-xl object-cover" />
            <strong>7C Consulting · Fiscal ST</strong>
          </div>
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-[.16em] text-[#eb5c00]">ACESSO AO SISTEMA</span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#17202a]">Bem-vindo ao Fiscal ST</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#64748b]">Entre com suas credenciais para acessar as informações fiscais das empresas autorizadas.</p>
          </div>
          <div className="rounded-2xl border border-[#e6ebf0] bg-white p-7 sm:p-9 shadow-[0_18px_45px_-25px_rgba(18,28,37,.22)]">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {errorMessage && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}
              <div className="space-y-2">
                <Label htmlFor="username" className="font-semibold text-[#344356]">Usuário</Label>
                <Input id="username" autoComplete="username" placeholder="Informe seu usuário" value={username} onChange={e => setUsername(e.target.value)} required disabled={isLoading} className="h-12 border-[#d8e0e8] bg-white" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold text-[#344356]">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Informe sua senha" value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} className="h-12 border-[#d8e0e8] bg-white pr-12" />
                  <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#64748b] hover:text-[#eb5c00]">
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="h-12 w-full bg-[#eb5c00] font-semibold text-white hover:bg-[#c84a00]">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                {isLoading ? "Validando acesso..." : "Entrar no sistema"}
              </Button>
            </form>
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#e6ebf0] pt-6 text-xs text-[#64748b]"><LockKeyhole size={14} /> Autenticação protegida pelo servidor</div>
          </div>
          <p className="mt-7 text-center text-xs text-[#94a3b8]">Problemas para acessar? Contate o administrador do sistema.</p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
