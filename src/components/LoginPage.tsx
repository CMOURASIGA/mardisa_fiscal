import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [errorMessage, setErrorMessage] = useState<string>("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const user = localStorage.getItem("user");
		if (user) {
			/* navigate({ to: "/private/home" }); */
		}
	}, [navigate]);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setErrorMessage("");
		setIsLoading(true);

		const userData = {
			username,
			password,
		};

		try {
			const apiUrl = import.meta.env.VITE_API_URL_LOGIN;
			const response = await fetch(`${apiUrl}/auth/login/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.detail || "Credenciais inválidas");
			}

			const { access, refresh, user } = data;

			localStorage.setItem("accessToken", access);
			localStorage.setItem("refreshToken", refresh);
			localStorage.setItem("user", JSON.stringify(user));

			navigate({ to: "/private/home" });
		} catch (error) {
			if (error instanceof Error) {
				setErrorMessage(error.message);
			} else {
				setErrorMessage("Erro inesperado");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
			</div>

			<Card className="w-full max-w-sm shadow-lg">
				<CardHeader className="space-y-1 text-center">
					<div className="flex justify-center mb-4">
						<div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
							<span className="text-primary-foreground text-xl font-bold">
								M
							</span>
						</div>
					</div>
					<CardTitle className="text-2xl font-bold">Bem-vindo</CardTitle>
					<CardDescription>
						Entre com suas credenciais para acessar o sistema
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent className="space-y-4">
						{errorMessage && (
							<div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center">
								{errorMessage}
							</div>
						)}
						<div className="space-y-2">
							<Label htmlFor="username">Usuário</Label>
							<Input
								id="username"
								type="text"
								placeholder="Seu usuário"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
								autoComplete="username"
								disabled={isLoading}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="password">Senha</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Sua senha"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									autoComplete="current-password"
									disabled={isLoading}
									className="pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
									onClick={() => setShowPassword(!showPassword)}
									disabled={isLoading}
								>
									{showPassword ? (
										<EyeOff className="h-4 w-4 text-muted-foreground" />
									) : (
										<Eye className="h-4 w-4 text-muted-foreground" />
									)}
									<span className="sr-only">
										{showPassword ? "Ocultar senha" : "Mostrar senha"}
									</span>
								</Button>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{isLoading ? "Entrando..." : "Entrar"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
};

export default LoginPage;
