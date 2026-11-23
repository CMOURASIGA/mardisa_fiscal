import CreateUser from "@/components/forms/CreateUser";
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
	type ColumnFiltersState,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const UserTable = () => {
	const { selectedEnterprise } = useEnterprise();

	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [blocked, setBlocked] = useState(false);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState<any>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<number | null>(null);

	const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
	const userRole = storedUser?.role;

	const getListEndpoint = (enterpriseId: number | null) => {
		if (userRole === "admin") return "/user";
		if (userRole === "admin-local" && enterpriseId)
			return `/fetch-user/${enterpriseId}`;
		return "";
	};

	const fetchData = async (enterpriseId: number | null) => {
		const endpoint = getListEndpoint(enterpriseId);
		if (!endpoint) {
			// Sem endpoint resolvível (papel sem acesso / sem empresa escolhida):
			// encerra o skeleton em vez de carregar para sempre.
			setData([]);
			setBlocked(true);
			setLoading(false);
			return;
		}

		setLoading(true);
		try {
			const response = await api.get(endpoint);
			setData(unwrapPaginated(response.data));
			setBlocked(false);
		} catch {
			setData([]);
			toast.error("Erro ao carregar usuários.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(selectedEnterprise);
	}, [selectedEnterprise]);

	const handleEdit = async (userId: number) => {
		setLoading(true);
		try {
			const res = await api.get(`/user/${userId}`);
			setSelectedUser(res.data);
			setShowCreateModal(true);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (!userToDelete) return;
		setLoading(true);
		try {
			await api.delete(`/user/${userToDelete}`);
			fetchData(selectedEnterprise);
		} finally {
			setLoading(false);
			setDeleteDialogOpen(false);
			setUserToDelete(null);
		}
	};

	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				accessorKey: "username",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Usuário
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				accessorKey: "email",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Email
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => row.original.email || "-",
			},
			{
				accessorKey: "first_name",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Nome
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) =>
					`${row.original.first_name || ""} ${row.original.last_name || ""}`.trim() ||
					"-",
			},
			{
				id: "groups",
				header: "Papel",
				cell: ({ row }) =>
					row.original.groups_detail?.map((g: any) => (
						<Badge key={g.id} variant="secondary" className="mr-1">
							{g.name}
						</Badge>
					)) || "-",
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
									setUserToDelete(row.original.id);
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
			columnFilters,
			globalFilter,
		},
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
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
					<h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
					<p className="text-muted-foreground">
						Gerencie os usuários do sistema
					</p>
				</div>
				<Button
					onClick={() => {
						setSelectedUser(null);
						setShowCreateModal(true);
					}}
				>
					Adicionar Usuário
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<Input
					placeholder="Buscar usuários..."
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
									{blocked
										? "Selecione uma empresa para listar os usuários."
										: "Nenhum usuário encontrado."}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} usuário(s) encontrado(s)
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
							{selectedUser?.id ? "Editar Usuário" : "Novo Usuário"}
						</DialogTitle>
						<DialogDescription>
							{selectedUser?.id
								? "Atualize os dados do usuário"
								: "Preencha os dados para criar um novo usuário"}
						</DialogDescription>
					</DialogHeader>
					<CreateUser
						user={selectedUser}
						onSuccess={() => fetchData(selectedEnterprise)}
						onClose={() => {
							setShowCreateModal(false);
							setSelectedUser(null);
						}}
					/>
				</DialogContent>
			</Dialog>

			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Excluir Usuário</DialogTitle>
						<DialogDescription>
							Tem certeza que deseja excluir este usuário? Esta ação não pode
							ser desfeita.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => {
								setDeleteDialogOpen(false);
								setUserToDelete(null);
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

export default UserTable;
