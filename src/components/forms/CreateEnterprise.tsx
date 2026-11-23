import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CreateEnterpriseProps {
	onSuccess: () => void;
	onClose: () => void;
	enterprise?: any;
}

const FIELD_OPTIONS = [
	{ value: "EDU", label: "Educação" },
	{ value: "SAU", label: "Saúde" },
	{ value: "TEC", label: "Tecnologia" },
	{ value: "ADM", label: "Administração" },
	{ value: "FIN", label: "Finanças" },
	{ value: "JUR", label: "Jurídico" },
	{ value: "VEI", label: "Veículo" },
	{ value: "OUT", label: "Outros" },
];

const CreateEnterprise = ({
	onSuccess,
	onClose,
	enterprise,
}: CreateEnterpriseProps) => {
	const [formData, setFormData] = useState({
		razao_social: "",
		CNPJ: "",
		nome_responsavel: "",
		fone_responsavel: "",
		email_responsavel: "",
		ie_contribuinte: "",
		field: "OUT",
	});

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (enterprise) {
			setFormData({
				razao_social: enterprise.razao_social || "",
				CNPJ: enterprise.CNPJ || "",
				nome_responsavel: enterprise.nome_responsavel || "",
				fone_responsavel: enterprise.fone_responsavel || "",
				email_responsavel: enterprise.email_responsavel || "",
				ie_contribuinte: enterprise.ie_contribuinte || "",
				field: enterprise.field ?? "OUT",
			});
		}
	}, [enterprise]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (enterprise?.id) {
				await api.put(`/enterprises/${enterprise.id}`, {
					...formData,
					field: formData.field || "OUT",
				});
				toast.success("Empresa atualizada com sucesso!");
			} else {
				await api.post("/enterprises", formData);
				toast.success("Empresa cadastrada com sucesso!");
			}

			onSuccess();
			onClose();
		} catch (err: any) {
			if (err.response?.data) {
				const backendErrors = Object.values(err.response.data).join(" ");
				toast.error(backendErrors || "Erro ao salvar empresa.");
			} else {
				toast.error("Erro ao conectar-se ao servidor.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-xl font-bold">
					{enterprise?.id ? "Editar Empresa" : "Nova Empresa"}
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
						<Label htmlFor="razao_social">Razão Social</Label>
						<Input
							id="razao_social"
							name="razao_social"
							value={formData.razao_social}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="CNPJ">CNPJ</Label>
						<Input
							id="CNPJ"
							name="CNPJ"
							value={formData.CNPJ}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="nome_responsavel">Nome do Responsável</Label>
						<Input
							id="nome_responsavel"
							name="nome_responsavel"
							value={formData.nome_responsavel}
							onChange={handleChange}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="fone_responsavel">Telefone</Label>
							<Input
								id="fone_responsavel"
								name="fone_responsavel"
								value={formData.fone_responsavel}
								onChange={handleChange}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="ie_contribuinte">Inscrição Estadual</Label>
							<Input
								id="ie_contribuinte"
								name="ie_contribuinte"
								value={formData.ie_contribuinte}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email_responsavel">Email</Label>
						<Input
							id="email_responsavel"
							name="email_responsavel"
							type="email"
							value={formData.email_responsavel}
							onChange={handleChange}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="field">Área</Label>
						<select
							id="field"
							name="field"
							value={formData.field}
							onChange={handleChange}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-background file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{FIELD_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
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
							{enterprise?.id ? "Atualizar" : "Cadastrar"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

export default CreateEnterprise;
