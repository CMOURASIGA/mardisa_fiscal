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
	Code,
	Database,
	FileDown,
	FileText,
	FileUp,
	LayoutDashboard,
	Menu,
	Receipt,
	ShoppingCart,
	Users,
} from "lucide-react";
import { useMemo, useState } from "react";

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

	const user = useMemo(() => {
		try {
			return JSON.parse(localStorage.getItem("user") || "null");
		} catch {
			return null;
		}
	}, []);

	const role: string = user?.role || "user";
	const isAdmin = role === "admin" || role === "admin-local";

	const systemSection: NavSection = {
		title: "Sistema",
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
		title: "Notas e Arquivos",
		items: [
			{
				label: "Notas de Compra",
				to: "/private/TablePurchase",
				icon: ShoppingCart,
			},
			{ label: "Notas de Venda", to: "/private/TableSale", icon: Receipt },
			{ label: "Relatórios", to: "/private/TableReport", icon: FileText },
			{ label: "Upload de Arquivo", to: "/private/uploadFile", icon: FileUp },
			{
				label: "Geração de Arquivo",
				to: "/private/generateFile",
				icon: FileDown,
			},
		],
	};

	const adminSection: NavSection = {
		title: "Administração",
		items: [
			{ label: "Tabela de Códigos", to: "/private/TableCod", icon: Code },
		],
	};

	const navContent = (minimized: boolean) => (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between p-4 border-b">
				{!minimized && (
					<span className="text-lg font-semibold text-foreground">Mardisa</span>
				)}
				{minimized && <LayoutDashboard className="h-5 w-5 mx-auto" />}
			</div>

			<div className="px-3 pb-4">
				<EnterpriseSelector minimized={minimized} />
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-2">
				<div className="space-y-6">
					<NavGroup
						section={systemSection}
						minimized={minimized}
						isActive={(path) => location.pathname.includes(path)}
					/>

					<NavGroup
						section={documentsSection}
						minimized={minimized}
						isActive={(path) => location.pathname.includes(path)}
					/>

					{isAdmin && (
						<NavGroup
							section={adminSection}
							minimized={minimized}
							isActive={(path) => location.pathname.includes(path)}
						/>
					)}
				</div>
			</nav>

			<div className="p-4 border-t">
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
					{!minimized && <span className="ml-2">Recolher</span>}
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
				<SheetContent side="left" className="w-72 p-0">
					{navContent(false)}
				</SheetContent>
			</Sheet>

			<aside
				className={cn(
					"hidden lg:flex flex-col h-screen bg-card border-r transition-all duration-300",
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
				<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
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
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
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
