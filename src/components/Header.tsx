import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "@tanstack/react-router";
import { Bell, LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useMemo } from "react";

export default function Header() {
	const navigate = useNavigate();
	const { theme, setTheme } = useTheme();

	const user = useMemo(() => {
		try {
			return JSON.parse(localStorage.getItem("user") || "null");
		} catch {
			return null;
		}
	}, []);

	const initials = user
		? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
		: "U";

	const userLabel = user
		? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username
		: "Usuário";

	const handleLogout = () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("user");
		navigate({ to: "/auth/login" });
	};

	return (
		<header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="flex h-14 items-center justify-between px-4">
				<div className="flex items-center gap-2 lg:hidden">
					<span className="text-lg font-semibold">Mardisa</span>
				</div>

				<div className="flex-1" />

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="relative"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
					>
						{theme === "dark" ? (
							<Sun className="h-4 w-4" />
						) : (
							<Moon className="h-4 w-4" />
						)}
						<span className="sr-only">Alternar tema</span>
					</Button>

					<Button variant="ghost" size="icon" className="relative">
						<Bell className="h-4 w-4" />
						<span className="sr-only">Notificações</span>
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarImage src="" alt={userLabel} />
									<AvatarFallback className="bg-primary text-primary-foreground text-xs">
										{initials}
									</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<DropdownMenuLabel className="font-normal">
								<div className="flex flex-col space-y-1">
									<p className="text-sm font-medium leading-none">
										{userLabel}
									</p>
									<p className="text-xs leading-none text-muted-foreground">
										{user?.email || user?.username}
									</p>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem className="gap-2">
								<User className="h-4 w-4" />
								<span>Perfil</span>
							</DropdownMenuItem>
							<DropdownMenuItem className="gap-2">
								<Settings className="h-4 w-4" />
								<span>Configurações</span>
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="gap-2 text-destructive focus:text-destructive"
								onClick={handleLogout}
							>
								<LogOut className="h-4 w-4" />
								<span>Sair</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
}
