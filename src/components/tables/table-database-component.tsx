import CreateDatabaseConnection from "@/components/forms/CreateDatabase";
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
import { useEnterprise } from "@/context/EnterpriseContext";
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
	Database,
	MoreHorizontal,
	Pencil,
	Plus,
	Server,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const DatabaseConnectionTable = () => {
	const { selectedEnterprise } = useEnterprise();

	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedConnection, setSelectedConnection] = useState<any>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [connectionToDelete, setConnectionToDelete] = useState<number | null>(
		null,
	);

	const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
	const userRole = storedUser?.role;

	const getListEndpoint = () => {
		if (userRole === "admin") return "/databases";
		if (userRole === "admin-local" && selectedEnterprise)
			return `/fetch-db/${selectedEnterprise}`;
		return null;
	};

	const fetchData = async () => {
		const endpoint = getListEndpoint();
		if (!endpoint) {
			// Sem endpoint resolvível: encerra o skeleton em vez de carregar para sempre.
			setData([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const response = await api.get(endpoint);
			setData(unwrapPaginated(response.data));
		} catch {
			setData([]);
			toast.error("Erro ao carregar conexões.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [selectedEnterprise]);

	const handleEdit = async (id: number) => {
		setLoading(true);
		try {
			const res = await api.get(`/databases/${id}`);
			setSelectedConnection(res.data);
			setShowCreateModal(true);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!connectionToDelete) return;
		setLoading(true);
		try {
			await api.delete(`/databases/${connectionToDelete}`);
			fetchData();
			toast.success("Conexão excluída com sucesso!");
		} finally {
			setLoading(false);
			setDeleteDialogOpen(false);
			setConnectionToDelete(null);
		}
	};

	const handleCreateDatabase = async (id: number) => {
		try {
			await api.post(`database/create/${id}/`);
			toast.success("Banco criado com sucesso!");
			fetchData();
		} catch {
			toast.error("Erro ao criar banco.");
		}
	};

	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				accessorKey: "enterprise.razao_social",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Razão Social
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => row.original.enterprise?.razao_social || "-",
			},
			{
				accessorKey: "db_name",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Nome do Banco
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				accessorKey: "hostname",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Host
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				accessorKey: "port",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Porta
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				accessorKey: "db_type",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Tipo
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => (
					<Badge variant="outline">{row.original.db_type}</Badge>
				),
			},
			{
				id: "status",
				header: "Status",
				cell: ({ row }) => (
					<Badge variant={row.original.is_created ? "default" : "secondary"}>
						{row.original.is_created ? "Criado" : "Pendente"}
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
							{!row.original.is_created && (
								<DropdownMenuItem
									onClick={() => handleCreateDatabase(row.original.id)}
								>
									<Server className="mr-2 h-4 w-4" />
									Criar Banco
								</DropdownMenuItem>
							)}
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								onClick={() => {
									setConnectionToDelete(row.original.id);
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
						<Database className="h-6 w-6" />
						Bancos de Dados
					</h1>
					<p className="text-muted-foreground">
						Gerencie as conexões de banco de dados
					</p>
				</div>
				<Button
					onClick={() => {
						setSelectedConnection(null);
						setShowCreateModal(true);
					}}
				>
					<Plus className="mr-2 h-4 w-4" />
					Nova Conexão
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<Input
					placeholder="Buscar conexões..."
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
									Nenhuma conexão encontrada.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} conexão(ões) encontrada(s)
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
							{selectedConnection?.id ? "Editar Conexão" : "Nova Conexão"}
						</DialogTitle>
						<DialogDescription>
							{selectedConnection?.id
								? "Atualize os dados da conexão"
								: "Preencha os dados para criar uma nova conexão"}
						</DialogDescription>
					</DialogHeader>
					<CreateDatabaseConnection
						connection={selectedConnection}
						onSuccess={fetchData}
						onClose={() => {
							setShowCreateModal(false);
							setSelectedConnection(null);
						}}
					/>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Excluir Conexão</DialogTitle>
						<DialogDescription>
							Tem certeza que deseja excluir esta conexão? Esta ação não pode
							ser desfeita.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setConnectionToDelete(null);
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

export default DatabaseConnectionTable;
