import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CreateCodeProps {
	onSuccess: () => void;
	onClose: () => void;
	enterpriseId: number;
	code?: any;
}

const CreateCode = ({
	onSuccess,
	onClose,
	enterpriseId: propEnterpriseId,
	code,
}: CreateCodeProps) => {
	const enterpriseId =
		propEnterpriseId ||
		Number(localStorage.getItem("selected_enterprise_id")) ||
		0;

	const [formData, setFormData] = useState({
		cod_sup: "",
		cod_int: "",
		un: "",
	});

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (code) {
			setFormData({
				cod_sup: code.cod_sup || "",
				cod_int: code.cod_int || "",
				un: code.un || "",
			});
		}
	}, [code]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			if (code?.id) {
				await api.put(`/update-code/${enterpriseId}/${code.id}`, {
					...formData,
				});
				toast.success("Código atualizado com sucesso!");
			} else {
				await api.post(`/insert-code/${enterpriseId}`, {
					...formData,
				});
				toast.success("Código criado com sucesso!");
			}

			onSuccess();
			onClose();
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Erro ao salvar código.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
				<CardTitle className="text-xl font-bold">
					{code?.id ? "Editar Código" : "Novo Código"}
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
						<Label htmlFor="cod_int">Código Interno</Label>
						<Input
							id="cod_int"
							name="cod_int"
							value={formData.cod_int}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="cod_sup">Código Fornecedor</Label>
						<Input
							id="cod_sup"
							name="cod_sup"
							value={formData.cod_sup}
							onChange={handleChange}
							required
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="un">Unidade</Label>
						<Input
							id="un"
							name="un"
							value={formData.un}
							onChange={handleChange}
						/>
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
							{code?.id ? "Atualizar" : "Salvar"}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};

export default CreateCode;
