import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { ShieldCheck } from "lucide-react";
import { Outlet } from "@tanstack/react-router";

const AppLayout: React.FC = () => (
  <div className="min-h-screen bg-[#f6f8fa]">
    <div className="flex min-w-0">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <div className="flex flex-wrap items-center gap-2 border-b border-[#f5dfce] bg-[#fff5ed] px-5 py-2.5 text-xs text-[#85410b] lg:px-8" role="status"><ShieldCheck className="h-4 w-4 shrink-0" /><strong>DEMONSTRAÇÃO OPERACIONAL</strong><span>Consultas reais permitidas. Importação e exportação simuladas localmente, sem gravação no banco oficial.</span></div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1440px]"><Outlet /></div>
        </main>
      </div>
    </div>
  </div>
);
export default AppLayout;
