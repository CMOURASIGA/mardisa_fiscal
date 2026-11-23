import { Badge } from "@/components/ui/badge";
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
import { useEnterprise } from "@/context/EnterpriseContext";
import api from "@/services/api";
import {
	type ColumnDef,
	type ExpandedState,
	type SortingState,
	flexRender,
	getCoreRowModel,
	getExpandedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	ArrowUpDown,
	ChevronDown,
	ChevronRight,
	FileText,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Row {
	dhRecbto: string;
	chNFe: string;
	cProd: string;
	vBCST: number;
	vProd: number;
	pICMSEfet: number;
}

interface GroupedRow {
	id: string;
	type: "year" | "month" | "record";
	label: string;

	totalCreditoICMS?: number;

	children?: GroupedRow[];

	dhRecbto?: string;
	chNFe?: string;
	cProd?: string;
	vBCST?: number;
	vProd?: number;
	pICMSEfet?: number;
}

const currencyMask = (value: number | string) => {
	if (!value) return "0,00";

	const parsed =
		typeof value === "string"
			? Number.parseFloat(value.replace(/[^\d.-]/g, ""))
			: value;

	return new Intl.NumberFormat("pt-BR", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(parsed);
};

const monthNames = [
	"Janeiro",
	"Fevereiro",
	"Março",
	"Abril",
	"Maio",
	"Junho",
	"Julho",
	"Agosto",
	"Setembro",
	"Outubro",
	"Novembro",
	"Dezembro",
];

const calculateCreditoICMS = (
	vBCST?: number,
	vProd?: number,
	pICMSEfet?: number,
) => {
	if (!vBCST || !vProd) return 0;

	return (vBCST - vProd) * ((pICMSEfet || 0) / 100);
};

const ReportTable = () => {
	const { selectedEnterprise } = useEnterprise();

	const [data, setData] = useState<Row[]>([]);
	const [loading, setLoading] = useState(true);
	const [sorting, setSorting] = useState<SortingState>([]);
	const [expanded, setExpanded] = useState<ExpandedState>({});
	const [globalFilter, setGlobalFilter] = useState("");

	const fetchData = async (enterpriseId: number) => {
		setLoading(true);

		try {
			const response = await api.get(`/fetch-report/${enterpriseId}`);

			const fetchedData = Array.isArray(response.data.data)
				? response.data.data
				: [];

			setData(fetchedData);
		} catch {
			setData([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (selectedEnterprise) {
			fetchData(selectedEnterprise);
		}
	}, [selectedEnterprise]);

	const groupedData = useMemo<GroupedRow[]>(() => {
		const yearsMap = new Map<number, Map<number, Row[]>>();

		// GROUP RAW DATA
		for (const item of data) {
			const date = new Date(item.dhRecbto);

			const year = date.getFullYear();
			const month = date.getMonth();

			if (!yearsMap.has(year)) {
				yearsMap.set(year, new Map());
			}

			const monthMap = yearsMap.get(year)!;

			if (!monthMap.has(month)) {
				monthMap.set(month, []);
			}

			monthMap.get(month)!.push(item);
		}

		// BUILD TABLE STRUCTURE
		return Array.from(yearsMap.entries())
			.sort((a, b) => b[0] - a[0])
			.map(([year, months]) => {
				let yearCreditoTotal = 0;

				const monthChildren: GroupedRow[] = Array.from(
					months.entries(),
				)
					.sort((a, b) => a[0] - b[0])
					.map(([month, rows]) => {
						// MONTH TOTAL
						const monthCreditoTotal = rows.reduce(
							(acc, row) => {
								return (
									acc +
									calculateCreditoICMS(
										row.vBCST,
										row.vProd,
										row.pICMSEfet,
									)
								);
							},
							0,
						);

						// ADD TO YEAR TOTAL
						yearCreditoTotal += monthCreditoTotal;

						return {
							id: `year-${year}-month-${month}`,
							type: "month",
							label: monthNames[month],

							totalCreditoICMS:
								monthCreditoTotal,

							children: rows.map(
								(row, index) => ({
									id: `record-${year}-${month}-${index}`,
									type: "record",
									label: "",

									vBCST: row.vBCST,
									vProd: row.vProd,
									pICMSEfet:
										row.pICMSEfet,
									cProd: row.cProd,
									chNFe: row.chNFe,
									dhRecbto:
										row.dhRecbto,
								}),
							),
						};
					});

				return {
					id: `year-${year}`,
					type: "year",
					label: String(year),

					totalCreditoICMS:
						yearCreditoTotal,

					children: monthChildren,
				};
			});
	}, [data]);

	const columns = useMemo<ColumnDef<GroupedRow>[]>(
		() => [
			{
				accessorKey: "label",
				header: "Período",

				cell: ({ row }) => {
					const original = row.original;

					if (original.type === "record") {
						return (
							<div className="pl-12">
								{new Date(
									original.dhRecbto || "",
								).toLocaleDateString(
									"pt-BR",
								)}
							</div>
						);
					}

					return (
						<div
							className={`flex items-center gap-2 ${
								original.type ===
								"month"
									? "pl-6"
									: ""
							}`}
						>
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6"
								onClick={row.getToggleExpandedHandler()}
							>
								{row.getIsExpanded() ? (
									<ChevronDown className="h-4 w-4" />
								) : (
									<ChevronRight className="h-4 w-4" />
								)}
							</Button>

							<div className="flex flex-col">
								<span className="font-semibold">
									{original.label}
								</span>

								<span className="text-xs text-muted-foreground">
									{original.children
										?.length || 0}{" "}
									item(s)
								</span>
							</div>
						</div>
					);
				},
			},

			{
				accessorKey: "chNFe",

				header: ({ column }) => (
					<Button
						variant="ghost"
						onClick={() =>
							column.toggleSorting(
								column.getIsSorted() ===
									"asc",
							)
						}
					>
						Chave
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				),

				cell: ({ row }) =>
					row.original.type === "record"
						? row.original.chNFe
						: "-",
			},

			{
				accessorKey: "cProd",

				header: "Código",

				cell: ({ row }) =>
					row.original.type === "record"
						? row.original.cProd
						: "-",
			},

			{
				accessorKey: "vBCST",

				header: "Cálculo ST",

				cell: ({ row }) => {
					if (
						row.original.type !==
						"record"
					) {
						return "-";
					}

					return currencyMask(
						row.original.vBCST || 0,
					);
				},
			},

			{
				accessorKey: "pICMSEfet",

				header: "Alíquota",

				cell: ({ row }) => {
					if (
						row.original.type !==
						"record"
					) {
						return "-";
					}

					return (
						<Badge variant="outline">
							{
								row.original
									.pICMSEfet
							}
							%
						</Badge>
					);
				},
			},

			{
				accessorKey: "vProd",

				header: "Valor Venda",

				cell: ({ row }) => {
					if (
						row.original.type !==
						"record"
					) {
						return "-";
					}

					return currencyMask(
						row.original.vProd || 0,
					);
				},
			},

			{
				id: "credito",

				header: "Crédito ICMS",

				cell: ({ row }) => {
					const original =
						row.original;

					// RECORD
					if (
						original.type ===
						"record"
					) {
						const credito =
							calculateCreditoICMS(
								original.vBCST,
								original.vProd,
								original.pICMSEfet,
							);

						return currencyMask(
							credito,
						);
					}

					// YEAR / MONTH
					return (
						<div className="font-bold">
							{currencyMask(
								original.totalCreditoICMS ||
									0,
							)}
						</div>
					);
				},
			},
		],
		[],
	);

	const table = useReactTable({
		data: groupedData,

		columns,

		state: {
			sorting,
			globalFilter,
			expanded,
		},

		onSortingChange: setSorting,
		onGlobalFilterChange:
			setGlobalFilter,
		onExpandedChange: setExpanded,

		getSubRows: (row) => row.children,

		getCoreRowModel:
			getCoreRowModel(),

		getExpandedRowModel:
			getExpandedRowModel(),

		getSortedRowModel:
			getSortedRowModel(),

		getFilteredRowModel:
			getFilteredRowModel(),

		getPaginationRowModel:
			getPaginationRowModel(),

		initialState: {
			pagination: {
				pageSize: 100,
			},
		},
	});

	return (
		<div className="space-y-4">
			<div>
				<h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
					<FileText className="h-6 w-6" />
					Substituição Tributária
				</h1>

				<p className="text-muted-foreground">
					Relatório agrupado por ano
					e mês
				</p>
			</div>

			<div className="flex items-center gap-4">
				<Input
					placeholder="Buscar relatórios..."
					value={globalFilter ?? ""}
					onChange={(e) =>
						setGlobalFilter(
							e.target.value,
						)
					}
					className="max-w-sm"
				/>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table
							.getHeaderGroups()
							.map(
								(
									headerGroup,
								) => (
									<TableRow
										key={
											headerGroup.id
										}
									>
										{headerGroup.headers.map(
											(
												header,
											) => (
												<TableHead
													key={
														header.id
													}
												>
													{header.isPlaceholder
														? null
														: flexRender(
																header
																	.column
																	.columnDef
																	.header,
																header.getContext(),
															)}
												</TableHead>
											),
										)}
									</TableRow>
								),
							)}
					</TableHeader>

					<TableBody>
						{loading ? (
							Array.from({
								length: 5,
							}).map(
								(_, i) => (
									<TableRow
										key={i}
									>
										{columns.map(
											(
												_,
												j,
											) => (
												<TableCell
													key={
														j
													}
												>
													<Skeleton className="h-4 w-full" />
												</TableCell>
											),
										)}
									</TableRow>
								),
							)
						) : table
								.getRowModel()
								.rows
								?.length ? (
							table
								.getRowModel()
								.rows.map(
									(
										row,
									) => (
										<TableRow
											key={
												row.id
											}
										>
											{row
												.getVisibleCells()
												.map(
													(
														cell,
													) => (
														<TableCell
															key={
																cell.id
															}
														>
															{flexRender(
																cell
																	.column
																	.columnDef
																	.cell,
																cell.getContext(),
															)}
														</TableCell>
													),
												)}
										</TableRow>
									),
								)
						) : (
							<TableRow>
								<TableCell
									colSpan={
										columns.length
									}
									className="h-24 text-center"
								>
									Nenhum
									relatório
									encontrado.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					{
						table.getRowModel()
							.rows.length
					}{" "}
					registro(s)
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							table.previousPage()
						}
						disabled={
							!table.getCanPreviousPage()
						}
					>
						Anterior
					</Button>

					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							table.nextPage()
						}
						disabled={
							!table.getCanNextPage()
						}
					>
						Próximo
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ReportTable;