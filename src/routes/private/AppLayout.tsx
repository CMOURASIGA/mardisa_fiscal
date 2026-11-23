import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Outlet } from "@tanstack/react-router";

const AppLayout: React.FC = () => (
  <div className="min-h-screen bg-[#f6f8fa]">
    <div className="flex min-w-0">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1440px]"><Outlet /></div>
        </main>
      </div>
    </div>
  </div>
);
export default AppLayout;
