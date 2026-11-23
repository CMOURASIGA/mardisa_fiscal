import CreateCode from "@/components/forms/CreateCode";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useEnterprise } from "@/context/EnterpriseContext";
import { useEnterpriseEffect } from "@/hooks/useEnterpriseEffect";
import api from "@/services/api";
import {
	type ColumnDef,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	Code,
	MoreHorizontal,
	Pencil,
	Plus,
	Trash2,
	Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const CodigosTable = () => {
	const { selectedEnterprise } = useEnterprise();

	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [selectedCodigo, setSelectedCodigo] = useState<any>(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showImportModal, setShowImportModal] = useState(false);
	const [csvFile, setCsvFile] = useState<File | null>(null);
	const [csvError, setCsvError] = useState<string | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [codigoToDelete, setCodigoToDelete] = useState<number | null>(null);

	const fetchData = async (enterpriseId: number) => {
		setLoading(true);
		try {
			const res = await api.get(`/fetch-code/${enterpriseId}`);
			setData(res.data?.data || []);
		} finally {
			setLoading(false);
		}
	};

	useEnterpriseEffect((enterpriseId) => {
		fetchData(enterpriseId);
	});

	const handleEdit = (row: any) => {
		setSelectedCodigo(row);
		setShowCreateModal(true);
	};

	const handleDelete = async () => {
		if (!codigoToDelete || !selectedEnterprise) return;
		setLoading(true);
		try {
			await api.delete(`/delete-code/${selectedEnterprise}/${codigoToDelete}`);
			fetchData(selectedEnterprise);
			toast.success("Código excluído com sucesso!");
		} catch {
			toast.error("Erro ao excluir código.");
		} finally {
			setLoading(false);
			setDeleteDialogOpen(false);
			setCodigoToDelete(null);
		}
	};

	const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.name.toLowerCase().endsWith(".csv")) {
			setCsvError("Apenas arquivos .csv são permitidos.");
			setCsvFile(null);
			return;
		}

		setCsvError(null);
		setCsvFile(file);
	};

	const handleCsvUpload = async () => {
		if (!csvFile) return;
		if (!selectedEnterprise) return;

		const formData = new FormData();
		formData.append("file", csvFile);

		try {
			setLoading(true);
			const res = await api.post(
				`/upload_csv/${selectedEnterprise}`,
				formData,
				{
					headers: { "Content-Type": "multipart/form-data" },
				},
			);

			toast.success(
				`Importação concluída! Inseridos: ${res.data.inserted}, Duplicados: ${res.data.duplicates}, Falharam: ${res.data.failed}`,
			);

			setShowImportModal(false);
			setCsvFile(null);
			fetchData(selectedEnterprise);
		} catch (err: any) {
			toast.error(err.response?.data?.error || "Erro ao importar CSV.");
		} finally {
			setLoading(false);
		}
	};

	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				accessorKey: "cod_sup",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Código Fornecedor
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				accessorKey: "cod_int",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Código Interno
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				accessorKey: "un",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Unidade
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				id: "actions",
				cell: ({ row }) => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={() => handleEdit(row.original)}>
								<Pencil className="mr-2 h-4 w-4" />
								Editar
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => {
									setCodigoToDelete(row.original.id);
									setDeleteDialogOpen(true);
								}}
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Excluir
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
		[],
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			globalFilter,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: {
				pageSize: 10,
			},
		},
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
						<Code className="h-6 w-6" />
						Tabela de Códigos
					</h1>
					<p className="text-muted-foreground">
						Gerencie os códigos de produtos
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" onClick={() => setShowImportModal(true)}>
						<Upload className="mr-2 h-4 w-4" />
						Importar CSV
					</Button>
					<Button
						onClick={() => {
							setSelectedCodigo(null);
							setShowCreateModal(true);
						}}
					>
						<Plus className="mr-2 h-4 w-4" />
						Novo Código
					</Button>
				</div>
			</div>

			<div className="flex items-center gap-4">
				<Input
					placeholder="Buscar códigos..."
					value={globalFilter ?? ""}
					onChange={(e) => setGlobalFilter(e.target.value)}
					className="max-w-sm"
				/>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{loading ? (
							Array.from({ length: 5 }).map((_, i) => (
								<TableRow key={i}>
									{columns.map((_, j) => (
										<TableCell key={j}>
											<Skeleton className="h-4 w-full" />
										</TableCell>
									))}
								</TableRow>
							))
						) : table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									Nenhum código encontrado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} código(s) encontrado(s)
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Anterior
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Próximo
					</Button>
				</div>
			</div>

			<Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
				<DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{selectedCodigo?.id ? "Editar Código" : "Novo Código"}
						</DialogTitle>
					</DialogHeader>
					{selectedEnterprise && (
						<CreateCode
							enterpriseId={selectedEnterprise}
							code={selectedCodigo}
							onSuccess={() => fetchData(selectedEnterprise)}
							onClose={() => setShowCreateModal(false)}
						/>
					)}
				</DialogContent>
			</Dialog>

			<Dialog open={showImportModal} onOpenChange={setShowImportModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Importar CSV</DialogTitle>
						<DialogDescription>
							Selecione um arquivo CSV para importar códigos
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4">
						<div className="space-y-2">
							<Label>Arquivo CSV</Label>
							<Input type="file" accept=".csv" onChange={handleCsvChange} />
						</div>
						{csvError && <p className="text-sm text-destructive">{csvError}</p>}
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setShowImportModal(false);
									setCsvFile(null);
									setCsvError(null);
								}}
							>
								Cancelar
							</Button>
							<Button onClick={handleCsvUpload} disabled={!csvFile}>
								Importar
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Excluir Código</DialogTitle>
						<DialogDescription>
							Tem certeza que deseja excluir este código? Esta ação não pode ser
							desfeita.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setCodigoToDelete(null);
							}}
						>
							Cancelar
						</Button>
						<Button variant="destructive" onClick={handleDelete}>
							Excluir
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default CodigosTable;
