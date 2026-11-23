import { Button } from "@/components/ui/button";
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
import { ArrowUpDown, Receipt } from "lucide-react";
import { useMemo, useState } from "react";

const SaleTable = () => {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState("");

	const fetchData = async (enterpriseId: number) => {
		if (!enterpriseId) return;

		setLoading(true);
		try {
			const response = await api.get(`/fetch-sale/${enterpriseId}`);
			const fetchedData = Array.isArray(response.data.data)
				? response.data.data
				: [];
			setData(fetchedData);
		} finally {
			setLoading(false);
		}
	};

	useEnterpriseEffect((enterpriseId) => {
		fetchData(enterpriseId);
	});

	const columns = useMemo<ColumnDef<any>[]>(
		() => [
			{
				accessorKey: "chNFe",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Chave
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
			},
			{
				accessorKey: "dhRecbto",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Data
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),
				cell: ({ row }) => {
					const date = new Date(row.original.dhRecbto);
					return date.toLocaleDateString("pt-BR");
				},
			},
			{
				accessorKey: "cProd",
				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					>
						Código do Produto
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
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
			<div>
				<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
					<Receipt className="h-6 w-6" />
					Notas de Venda
				</h1>
				<p className="text-muted-foreground">
					Visualize as notas fiscais de venda
				</p>
			</div>

			<div className="flex items-center gap-4">
				<Input
					placeholder="Buscar vendas..."
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
									Nenhuma venda encontrada.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{table.getFilteredRowModel().rows.length} venda(s) encontrada(s)
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
		</div>
	);
};

export default SaleTable;
