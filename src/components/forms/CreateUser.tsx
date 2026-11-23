import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unwrapPaginated } from "@/lib/utils";
import api from "@/services/api";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CreateUserProps {
	onSuccess: () => void;
	onClose: () => void;
	user?: any;
}

const CreateUser = ({ onSuccess, onClose, user }: CreateUserProps) => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
		passwordConfirm: "",
		firstName: "",
		lastName: "",
		email: "",
	});

	const [groups, setGroups] = useState<any[]>([]);
	const [enterprises, setEnterprises] = useState<any[]>([]);

	const [selectedGroup, setSelectedGroup] = useState<string>("");
	const [selectedEnterprises, setSelectedEnterprises] = useState<number[]>([]);

	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(true);

	useEffect(() => {
		if (user?.id) {
			setFormData({
				username: user.username || "",
				password: "",
				passwordConfirm: "",
				firstName: user.first_name || "",
				lastName: user.last_name || "",
				email: user.email || "",
			});

			const grp = user.groups_detail?.[0]?.id;
			setSelectedGroup(grp ? String(grp) : "");

			setSelectedEnterprises(
				Array.isArray(user.enterprises) ? user.enterprises : [],
			);
		}
	}, [user]);

	useEffect(() => {
		const fetchData = async () => {
			setFetching(true);
			try {
				const [grpRes, entRes] = await Promise.all([
					api.get("/groups"),
					api.get("/enterprises"),
				]);

				setGroups(unwrapPaginated(grpRes.data));
				setEnterprises(unwrapPaginated(entRes.data));
			} catch (err) {
				toast.error("Erro ao carregar dados");
			} finally {
				setFetching(false);
			}
		};

		fetchData();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		if (formData.password && formData.password !== formData.passwordConfirm) {
			toast.error("As senhas não correspondem!");
			setLoading(false);
			return;
		}

		try {
			const payload = {
				username: formData.username,
				email: formData.email,
				first_name: formData.firstName,
				last_name: formData.lastName,
				groups: selectedGroup ? [Number(selectedGroup)] : [],
				enterprises: selectedEnterprises ?? [],
				...(formData.password ? { password: formData.password } : {}),
			};

			if (user?.id) {
				await api.put(`/user/${user.id}`, payload);
				toast.success("Usuário atualizado com sucesso!");
			} else {
				await api.post("/user", payload);
				toast.success("Usuário criado com sucesso!");
			}

			onSuccess();
			onClose();
		} catch (err: any) {
			if (err.response?.data) {
				const backendErrors = Object.values(err.response.data).join(" ");
				toast.error(backendErrors || "Erro ao salvar usuário.");
			} else {
				toast.error("Erro ao conectar-se ao servidor.");
			}
		} finally {
			setLoading(false);
		}
	};

	if (fetching) {
		return (
			<Card className="w-full max-w-lg">
				<CardContent className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-xl font-bold">
					{user?.id ? "Editar Usuário" : "Novo Usuário"}
				</CardTitle>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					onClick={onClose}
				>
					<X className="h-4 w-4" />
				</Button>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="firstName">Primeiro Nome</Label>
							<Input
								id="firstName"
								name="firstName"
								value={formData.firstName}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="lastName">Último Nome</Label>
							<Input
								id="lastName"
								name="lastName"
								value={formData.lastName}
								onChange={handleChange}
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="username">Usuário</Label>
						<Input
							id="username"
							name="username"
							value={formData.username}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="password">Senha {user?.id && "(opcional)"}</Label>
							<Input
								id="password"
								name="password"
								type="password"
								value={formData.password}
								onChange={handleChange}
								placeholder={user?.id ? "Deixe vazio para não alterar" : ""}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="passwordConfirm">
								Confirmar Senha {user?.id && "(opcional)"}
							</Label>
							<Input
								id="passwordConfirm"
								name="passwordConfirm"
								type="password"
								value={formData.passwordConfirm}
								onChange={handleChange}
								placeholder={user?.id ? "Deixe vazio para não alterar" : ""}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="group">Papel</Label>
						<select
							id="group"
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-background file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							value={selectedGroup ?? ""}
							onChange={(e) => setSelectedGroup(e.target.value)}
							required
						>
							<option value="">Selecione um papel</option>
							{groups.map((grp) => (
								<option key={grp.id} value={grp.id}>
									{grp.name}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<Label className="text-sm font-medium">Empresas</Label>
						<div className="max-h-40 overflow-y-auto space-y-2 rounded-md border p-2">
							{enterprises.map((ent) => {
								const isSelected = selectedEnterprises.includes(ent.id);
								return (
									<div key={ent.id} className="flex items-center space-x-2">
										<Checkbox
											id={`ent-${ent.id}`}
											checked={isSelected}
											onCheckedChange={() =>
												setSelectedEnterprises((prev) =>
													prev.includes(ent.id)
														? prev.filter((id) => id !== ent.id)
														: [...prev, ent.id],
												)
											}
										/>
										<label
											htmlFor={`ent-${ent.id}`}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
										>
											{ent.razao_social}
										</label>
									</div>
								);
							})}
						</div>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							className="flex-1"
							onClick={onClose}
						>
							Cancelar
						</Button>
						<Button type="submit" className="flex-1" disabled={loading}>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{user?.id ? "Atualizar" : "Cadastrar"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

export default CreateUser;
