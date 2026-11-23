import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
	ArrowDownRight,
	ArrowUpRight,
	Building2,
	Download,
	FileText,
	Receipt,
	ShoppingCart,
	Upload,
	Users,
} from "lucide-react";
import { useMemo } from "react";

export const Route = createFileRoute("/private/home")({
	beforeLoad: () => {
		const user = JSON.parse(localStorage.getItem("user") || "null");

		if (!user) throw redirect({ to: "/auth/login" });
	},
	component: Dashboard,
});

function Dashboard() {
	const user = useMemo(() => {
		try {
			return JSON.parse(localStorage.getItem("user") || "null");
		} catch {
			return null;
		}
	}, []);

	const userName = user
		? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
		: "Usuário";

	const isAdmin = user?.role === "admin" || user?.role === "admin-local";

	const stats = [
		{
			title: "Notas de Compra",
			value: "0",
			change: "+0%",
			trend: "up",
			icon: ShoppingCart,
			href: "/private/TablePurchase",
		},
		{
			title: "Notas de Venda",
			value: "0",
			change: "+0%",
			trend: "up",
			icon: Receipt,
			href: "/private/TableSale",
		},
		{
			title: "Relatórios",
			value: "0",
			change: "0%",
			trend: "neutral",
			icon: FileText,
			href: "/private/TableReport",
		},
		{
			title: "Arquivos Processados",
			value: "0",
			change: "+0%",
			trend: "up",
			icon: Upload,
			href: "/private/uploadFile",
		},
	];

	const quickActions = [
		{
			title: "Upload de Arquivo",
			description: "Importe notas fiscais em lote",
			icon: Upload,
			href: "/private/uploadFile",
			buttonText: "Upload",
		},
		{
			title: "Geração de Arquivo",
			description: "Exporte relatórios em diferentes formatos",
			icon: Download,
			href: "/private/generateFile",
			buttonText: "Gerar",
		},
	];

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold tracking-tight">
					Bem-vindo, {userName}
				</h1>
				<p className="text-muted-foreground">
					Aqui está um resumo da sua atividade recente
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<Card
							key={stat.title}
							className="hover:shadow-md transition-shadow"
						>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">
									{stat.title}
								</CardTitle>
								<Icon className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{stat.value}</div>
								<div className="flex items-center gap-1 text-xs">
									{stat.trend === "up" && (
										<ArrowUpRight className="h-3 w-3 text-green-500" />
									)}
									{stat.trend === "down" && (
										<ArrowDownRight className="h-3 w-3 text-red-500" />
									)}
									<span
										className={
											stat.trend === "up"
												? "text-green-500"
												: stat.trend === "down"
													? "text-red-500"
													: "text-muted-foreground"
										}
									>
										{stat.change}
									</span>
									<span className="text-muted-foreground">este mês</span>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="w-full mt-4"
									asChild
								>
									<Link to={stat.href}>Ver mais</Link>
								</Button>
							</CardContent>
						</Card>
					);
				})}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{quickActions.map((action) => {
					const Icon = action.icon;
					return (
						<Card
							key={action.title}
							className="hover:shadow-md transition-shadow"
						>
							<CardHeader className="flex flex-row items-center gap-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Icon className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-base">{action.title}</CardTitle>
									<p className="text-xs text-muted-foreground">
										{action.description}
									</p>
								</div>
							</CardHeader>
							<CardContent>
								<Button className="w-full" asChild>
									<Link to={action.href}>{action.buttonText}</Link>
								</Button>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{isAdmin && (
				<div>
					<h2 className="text-xl font-semibold mb-4">Administração</h2>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center gap-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Users className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-base">Usuários</CardTitle>
									<p className="text-xs text-muted-foreground">
										Gerenciar usuários do sistema
									</p>
								</div>
							</CardHeader>
							<CardContent>
								<Button variant="secondary" className="w-full" asChild>
									<Link to="/private/TableUser">Gerenciar</Link>
								</Button>
							</CardContent>
						</Card>

						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center gap-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Building2 className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-base">Empresas</CardTitle>
									<p className="text-xs text-muted-foreground">
										Gerenciar empresas cadastradas
									</p>
								</div>
							</CardHeader>
							<CardContent>
								<Button variant="secondary" className="w-full" asChild>
									<Link to="/private/TableEnterprise">Gerenciar</Link>
								</Button>
							</CardContent>
						</Card>

						<Card className="hover:shadow-md transition-shadow">
							<CardHeader className="flex flex-row items-center gap-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<FileText className="h-5 w-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-base">Tabela de Códigos</CardTitle>
									<p className="text-xs text-muted-foreground">
										Configurar códigos fiscais
									</p>
								</div>
							</CardHeader>
							<CardContent>
								<Button variant="secondary" className="w-full" asChild>
									<Link to="/private/TableCod">Configurar</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Badge variant="outline">{user?.role || "user"}</Badge>
					<span className="text-sm text-muted-foreground">
						Último login: {new Date().toLocaleDateString("pt-BR")}
					</span>
				</div>
			</div>
		</div>
	);
}
