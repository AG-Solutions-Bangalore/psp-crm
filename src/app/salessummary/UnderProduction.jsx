import {
  GRANUALS_TO_YARN_PRODUCTION,
  RAW_MATERIAL_PRODUCTION_LIST,
  YARN_TO_FABRIC_PRODUCTION,
  YARN_TO_FABRIC_WORK_PRODUCTION,
} from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import moment from "moment";
import { useState, useMemo } from "react";

const fetchProductionData = (url, token) =>
  apiClient
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data.data);

const UnderProduction = () => {
  const token = usetoken();
  const [globalFilter, setGlobalFilter] = useState("");
  const [granualFilter, setGranualFilter] = useState("");
  const [yarnFilter, setYarnFilter] = useState("");
  const [fabricWorkFilter, setFabricWorkFilter] = useState("");
  const { data: rawMaterialProduction, isLoading } = useQuery({
    queryKey: ["rawMaterialProduction"],
    queryFn: () => fetchProductionData(RAW_MATERIAL_PRODUCTION_LIST, token),
  });

  const { data: granualsToYarnProduction } = useQuery({
    queryKey: ["granualsToYarnProduction"],
    queryFn: () => fetchProductionData(GRANUALS_TO_YARN_PRODUCTION, token),
  });

  const { data: yarnToFabricProduction } = useQuery({
    queryKey: ["yarnToFabricProduction"],
    queryFn: () => fetchProductionData(YARN_TO_FABRIC_PRODUCTION, token),
  });

  const { data: yarnToFabricWorkProduction } = useQuery({
    queryKey: ["yarnToFabricWorkProduction"],
    queryFn: () => fetchProductionData(YARN_TO_FABRIC_WORK_PRODUCTION, token),
  });

  const filteredRawMaterial = useMemo(() => {
    return (rawMaterialProduction || []).filter(
      (item) => item.productionCount === 0
    );
  }, [rawMaterialProduction]);

  const filteredGranual = useMemo(() => {
    return (granualsToYarnProduction || []).filter(
      (item) => item.productionCount === 0
    );
  }, [granualsToYarnProduction]);
  const filteredYarn = useMemo(() => {
    return (yarnToFabricProduction || []).filter(
      (item) => item.productionCount === 0
    );
  }, [yarnToFabricProduction]);

  const filteredFabricWork = useMemo(() => {
    return (yarnToFabricWorkProduction || []).filter(
      (item) => item.productionCount === 0
    );
  }, [yarnToFabricWorkProduction]);

  const yarnColumns = [
    {
      accessorKey: "index",
      id: "Sl No",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "yarn_to_fabric_p_date",
      header: "Date",
      cell: ({ row }) => (
        <div>
          {moment(row.original.yarn_to_fabric_p_date).format("DD-MM-YYYY")}
        </div>
      ),
    },
    {
      accessorKey: "total_weight",
      header: "Input",
      cell: ({ row }) => <div>{row.getValue("total_weight")}</div>,
    },
    {
      accessorKey: "productionWeight",
      header: "Output",
      cell: ({ row }) => <div>{row.getValue("productionWeight")}</div>,
    },
  ];

  const columns = [
    {
      accessorKey: "index",
      id: "Sl No",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const date =
          row.original.raw_material_to_p_date ||
          row.original.granuals_to_yp_date;
        return <div>{moment(date).format("DD-MM-YYYY")}</div>;
      },
    },
    {
      accessorKey: "total_weight",
      header: "Input",
      cell: ({ row }) => <div>{row.getValue("total_weight")}</div>,
    },
    {
      accessorKey: "productionWeight",
      header: "Output",
      cell: ({ row }) => <div>{row.getValue("productionWeight")}</div>,
    },
  ];

  const table = useReactTable({
    data: filteredRawMaterial,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const tableGranual = useReactTable({
    data: filteredGranual,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: granualFilter,
    },
    onGlobalFilterChange: setGranualFilter,
  });
  const tableYarn = useReactTable({
    data: filteredYarn,
    columns: yarnColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: yarnFilter },
    onGlobalFilterChange: setYarnFilter,
  });

  const tableFabricWork = useReactTable({
    data: filteredFabricWork,
    columns: yarnColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter: fabricWorkFilter },
    onGlobalFilterChange: setFabricWorkFilter,
  });
  return (
    <div className="p-4">
      <div className="flex justify-center mb-4">
        <h2 className="text-lg font-semibold">Under Production Data</h2>
      </div>

      {/* Raw Material Table */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl">Raw Material</h1>
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search Production..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Granual Table */}
      <div className="w-full">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl">Granual</h1>
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search Production..."
              value={granualFilter}
              onChange={(e) => setGranualFilter(e.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {tableGranual.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : tableGranual.getRowModel().rows?.length ? (
                tableGranual.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="w-full mb-8">
        <div className="flex items-center justify-between py-4">
          <h1 className="text-xl">Raw Material</h1>
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search Production..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default UnderProduction;
