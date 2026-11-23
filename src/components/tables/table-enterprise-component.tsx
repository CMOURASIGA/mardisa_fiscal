import CreateEnterprise from "@/components/forms/CreateEnterprise";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { unwrapPaginated } from "@/lib/utils";
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
	Building2,
	MoreHorizontal,
	Pencil,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const FIELD_MAP: { [key: string]: string } = {
	EDU: "Educação",
	SAU: "Saúde",
	TEC: "Tecnologia",
	ADM: "Administração",
	FIN: "Finanças",
	JUR: "Jurídico",
	VEI: "Veículo",
	OUT: "Outros",
};

const EnterpriseTable = () => {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedEnterprise, setSelectedEnterprise] = useState<any>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [enterpriseToDelete, setEnterpriseToDelete] = useState<number | null>(
		null,
	);

	const fetchData = async () => {
		setLoading(true);
		try {
			const response = await api.get("/enterprises");
			setData(unwrapPaginated(response.data));
		} catch {
			console.error("Erro ao carregar empresas");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	const handleEdit = async (id: number) => {
		setLoading(true);
		try {
			const res = await api.get(`/enterprises/${id}`);
			setSelectedEnterprise(res.data);
			setShowCreateModal(true);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!enterpriseToDelete) return;
		setLoading(true);
		try {
			await api.delete(`/enterprises/${enterpriseToDelete}`);
			fetchData();
		} finally {
			setLoading(false);
			setDeleteDialogOpen(false);
			setEnterpriseToDelete(null);
		}
	};

	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				accessorKey: "razao_social",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Razão Social
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				accessorKey: "CNPJ",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						CNPJ
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				accessorKey: "nome_responsavel",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Responsável
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => row.original.nome_responsavel || "-",
			},
			{
				accessorKey: "fone_responsavel",
				header: "Telefone",
				cell: ({ row }) => row.original.fone_responsavel || "-",
			},
			{
				accessorKey: "email_responsavel",
				header: "Email",
				cell: ({ row }) => row.original.email_responsavel || "-",
			},
			{
				accessorKey: "field",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Área
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => (
					<Badge variant="outline">
						{FIELD_MAP[row.original.field] || "Outros"}
					</Badge>
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
							<DropdownMenuItem onClick={() => handleEdit(row.original.id)}>
								<Pencil className="mr-2 h-4 w-4" />
								Editar
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => {
									setEnterpriseToDelete(row.original.id);
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
						<Building2 className="h-6 w-6" />
						Empresas
					</h1>
					<p className="text-muted-foreground">
						Gerencie as empresas cadastradas
					</p>
				</div>
				<Button
					onClick={() => {
						setSelectedEnterprise(null);
						setShowCreateModal(true);
					}}
				>
					Adicionar Empresa
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<Input
					placeholder="Buscar empresas..."
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
									Nenhuma empresa encontrada.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} empresa(s) encontrada(s)
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
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle>
							{selectedEnterprise?.id ? "Editar Empresa" : "Nova Empresa"}
						</DialogTitle>
						<DialogDescription>
							{selectedEnterprise?.id
								? "Atualize os dados da empresa"
								: "Preencha os dados para cadastrar uma nova empresa"}
						</DialogDescription>
					</DialogHeader>
					<CreateEnterprise
						enterprise={selectedEnterprise}
						onSuccess={fetchData}
						onClose={() => {
							setShowCreateModal(false);
							setSelectedEnterprise(null);
						}}
					/>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Excluir Empresa</DialogTitle>
						<DialogDescription>
							Tem certeza que deseja excluir esta empresa? Esta ação não pode
							ser desfeita.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setEnterpriseToDelete(null);
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

export default EnterpriseTable;
