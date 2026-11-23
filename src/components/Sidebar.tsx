import EnterpriseSelector from "@/components/EnterpriseSelector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
	Building2,
	ChevronLeft,
	ChevronRight,
	Database,
	Settings2,
	FileDown,
	FileText,
	FileUp,
	LayoutDashboard,
	Menu,
	Receipt,
	ShoppingCart,
	Users,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
	label: string;
	to: string;
	icon: React.ComponentType<{ className?: string }>;
	badge?: string;
}

interface NavSection {
	title: string;
	items: NavItem[];
}

const Sidebar: React.FC = () => {
	const [isMinimized, setIsMinimized] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();
	let admin = false;
	try { const u = JSON.parse(localStorage.getItem("user") || "null"); admin = ["admin", "admin-local"].includes(u?.role); } catch { /* sessão inválida */ }


	const systemSection: NavSection = {
		title: "Cadastros e acessos (consulta)",
		items: [
			{ label: "Usuários", to: "/private/TableUser", icon: Users },
			{ label: "Empresas", to: "/private/TableEnterprise", icon: Building2 },
			{
				label: "Bancos de Dados",
				to: "/private/TableDatabase",
				icon: Database,
			},
		],
	};

	const documentsSection: NavSection = {
		title: "Processamento fiscal",
		items: [
			{
				label: "Notas de Compra",
				to: "/private/TablePurchase",
				icon: ShoppingCart,
			},
			{ label: "Notas de Venda", to: "/private/TableSale", icon: Receipt },
			{ label: "Apuração / Relatórios", to: "/private/TableReport", icon: FileText },
			{ label: "Simular importação XML", to: "/private/uploadFile", icon: FileUp },
			{
				label: "Exportar simulação",
				to: "/private/generateFile",
				icon: FileDown,
			},
		],
	};


	const navContent = (minimized: boolean) => (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between p-4 border-b border-[#293642]">
				{!minimized && (
					<div className="flex items-center gap-3"><img src="/logo-7c.svg" alt="7C Software" className="h-9 w-9 rounded-lg" /><div><span className="block text-sm font-semibold text-white">Fiscal ST</span><span className="block text-[11px] text-[#93a2b2]">7C Software</span></div></div>
				)}
				{minimized && <img src="/logo-7c.svg" alt="7C Software" className="mx-auto h-9 w-9 rounded-lg" />}
			</div>

			<div className="px-3 pb-4">
				<EnterpriseSelector minimized={minimized} />
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-2">
                <Link to="/private/home" className={cn("mb-5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium", location.pathname.toLowerCase() === "/private/home" ? "bg-[#eb5c00] text-white" : "text-[#bfccd7] hover:bg-[#1b2a36] hover:text-white")}><LayoutDashboard className="h-4 w-4 shrink-0" />{!minimized && <span>Visão geral</span>}</Link>
				<div className="space-y-6">
					<NavGroup
						section={systemSection}
						minimized={minimized}
						isActive={(path) => location.pathname.toLowerCase() === path.toLowerCase()}
					/>

					<NavGroup
						section={documentsSection}
						minimized={minimized}
						isActive={(path) => location.pathname.includes(path)}
					/>

					{admin && <div className="mt-6"><NavGroup section={{ title: "Administração técnica", items: [{ label: "Conexão de leitura", to: "/private/connectionSettings", icon: Settings2 }] }} minimized={minimized} isActive={(path) => location.pathname.toLowerCase() === path.toLowerCase()} /></div>}
				</div>
			</nav>

			<div className="p-4 border-t border-[#293642]">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsMinimized(!isMinimized)}
					className={cn("w-full justify-center", !minimized && "justify-start")}
				>
					{minimized ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<ChevronLeft className="h-4 w-4" />
					)}
					{!minimized && <span className="ml-2 text-[#bfccd7]">Recolher</span>}
				</Button>
			</div>
		</div>
	);

	return (
		<>
			<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
				<SheetTrigger asChild className="lg:hidden fixed top-4 left-4 z-50">
					<Button variant="outline" size="icon">
						<Menu className="h-4 w-4" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-72 bg-[#121c25] p-0 text-white">
					{navContent(false)}
				</SheetContent>
			</Sheet>

			<aside
				className={cn(
					"hidden lg:flex flex-col h-screen bg-[#121c25] text-[#eaf0f6] border-r border-[#293642] transition-all duration-300",
					isMinimized ? "w-16" : "w-64",
				)}
			>
				{navContent(isMinimized)}
			</aside>
		</>
	);
};

interface NavGroupProps {
	section: NavSection;
	minimized: boolean;
	isActive: (path: string) => boolean;
}

const NavGroup: React.FC<NavGroupProps> = ({
	section,
	minimized,
	isActive,
}) => {
	return (
		<div>
			{!minimized && (
				<h3 className="text-xs font-semibold text-[#8c9bab] uppercase tracking-wider mb-2 px-3">
					{section.title}
				</h3>
			)}
			<div className="space-y-1">
				{section.items.map((item) => {
					const Icon = item.icon;
					const active = isActive(item.to.toLowerCase());

					return (
						<Link
							key={item.to}
							to={item.to}
							className={cn(
								"flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
								active
									? "bg-primary text-primary-foreground"
									: "text-[#bfccd7] hover:bg-[#1b2a36] hover:text-white",
							)}
						>
							<Icon className={cn("h-4 w-4", minimized && "mx-auto")} />
							{!minimized && <span>{item.label}</span>}
							{!minimized && item.badge && (
								<Badge variant="secondary" className="ml-auto text-xs">
									{item.badge}
								</Badge>
							)}
						</Link>
					);
				})}
			</div>
		</div>
	);
};

export default Sidebar;
