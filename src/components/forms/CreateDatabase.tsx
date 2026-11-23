import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { unwrapPaginated } from "@/lib/utils";
import api from "@/services/api";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const DB_TYPES = [
	{ value: "postgres", label: "PostgreSQL" },
	{ value: "mysql", label: "MySQL" },
	{ value: "sqlite", label: "SQLite" },
	{ value: "oracle", label: "Oracle" },
	{ value: "mssql", label: "SQL Server" },
];

interface Props {
	onSuccess: () => void;
	onClose: () => void;
	connection?: any;
}

const CreateDatabaseConnection = ({
	onSuccess,
	onClose,
	connection,
}: Props) => {
	const [enterprises, setEnterprises] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const [formData, setFormData] = useState({
		enterprise_id: "",
		db_name: "",
		hostname: "",
		port: 3306,
		username: "",
		password: "",
		passwordConfirm: "",
		db_type: "mysql",
	});

	useEffect(() => {
		if (connection) {
			setFormData({
				enterprise_id: connection.enterprise?.id?.toString() || "",
				db_name: connection.db_name || "",
				hostname: connection.hostname || "",
				port: connection.port || 3306,
				username: connection.username || "",
				password: "",
				passwordConfirm: "",
				db_type: connection.db_type || "mysql",
			});
		}
	}, [connection]);

	useEffect(() => {
		api.get("/enterprises")
			.then((res) => setEnterprises(unwrapPaginated(res.data)))
			.catch(() => toast.error("Erro ao carregar empresas."))
			.finally(() => setLoading(false));
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "port" ? Number(value) : value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const payload = {
				enterprise_id: Number(formData.enterprise_id),
				db_name: formData.db_name,
				hostname: formData.hostname,
				port: formData.port,
				username: formData.username,
				db_type: formData.db_type,
				password: formData.password
					? formData.password
					: connection?.password || "",
			};

			if (connection?.id) {
				await api.put(`/databases/${connection.id}`, payload);
				toast.success("Conexão atualizada com sucesso!");
			} else {
				await api.post("/databases", payload);
				toast.success("Conexão criada com sucesso!");
			}

			onSuccess();
			onClose();
		} catch (err: any) {
			if (err.response?.data) {
				toast.error(Object.values(err.response.data).join(" "));
			} else {
				toast.error("Erro ao salvar conexão.");
			}
		} finally {
			setSubmitting(false);
			setFormData((prev) => ({ ...prev, password: "", passwordConfirm: "" }));
		}
	};

	if (loading) {
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
					{connection?.id ? "Editar Conexão" : "Nova Conexão"}
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
					<div className="space-y-2">
						<Label htmlFor="enterprise_id">Empresa</Label>
						<select
							id="enterprise_id"
							name="enterprise_id"
							value={formData.enterprise_id}
							onChange={handleChange}
							required
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-background file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="">Selecione uma empresa</option>
							{enterprises.map((e) => (
								<option key={e.id} value={e.id}>
									{e.razao_social}
								</option>
							))}
						</select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="db_name">Nome do Banco</Label>
						<Input
							id="db_name"
							name="db_name"
							value={formData.db_name}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="hostname">Hostname</Label>
							<Input
								id="hostname"
								name="hostname"
								value={formData.hostname}
								onChange={handleChange}
								required
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="port">Porta</Label>
							<Input
								id="port"
								name="port"
								type="number"
								value={formData.port}
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
						<Label htmlFor="db_type">Tipo de Banco</Label>
						<select
							id="db_type"
							name="db_type"
							value={formData.db_type}
							onChange={handleChange}
							required
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-background file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{DB_TYPES.map((t) => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="password">Senha</Label>
							<Input
								id="password"
								name="password"
								type="password"
								value={formData.password}
								onChange={handleChange}
								required={!connection?.id}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="passwordConfirm">Confirmar Senha</Label>
							<Input
								id="passwordConfirm"
								name="passwordConfirm"
								type="password"
								value={formData.passwordConfirm}
								onChange={handleChange}
								required={!connection?.id}
							/>
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
						<Button type="submit" className="flex-1" disabled={submitting}>
							{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{connection?.id ? "Atualizar" : "Criar"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

export default CreateDatabaseConnection;
