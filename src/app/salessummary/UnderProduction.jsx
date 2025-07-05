import {
  GRANUALS_TO_YARN_PRODUCTION,
  RAW_MATERIAL_PRODUCTION_LIST,
  YARN_TO_FABRIC_PRODUCTION,
  YARN_TO_FABRIC_WORK_PRODUCTION,
} from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { useQuery } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import moment from "moment";
import { useMemo, useState } from "react";
import DataTable from "./DataTable";

const fetchProductionData = (url, token) =>
  apiClient
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data.data);

const UnderProduction = ({ pdf }) => {
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
  const rawMaterialColumns = [
    {
      accessorKey: "index",
      id: "Sl No",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "raw_material_to_p_date",
      header: "Date",
      cell: ({ row }) => (
        <div>
          {moment(row.original.raw_material_to_p_date).format("DD-MM-YYYY")}
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

  const granualsColumns = [
    {
      accessorKey: "index",
      id: "Sl No",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "granuals_to_yp_date",
      header: "Date",
      cell: ({ row }) => (
        <div>
          {moment(row.original.granuals_to_yp_date).format("DD-MM-YYYY")}
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

  const yarnColumns = [
    {
      accessorKey: "index",
      id: "Sl No",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "yarn_to_fp_date",
      header: "Date",
      cell: ({ row }) => (
        <div>{moment(row.original.yarn_to_fp_date).format("DD-MM-YYYY")}</div>
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

  const fabricWorkColumns = [
    {
      accessorKey: "index",
      id: "Sl No",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "yarn_to_fwp_date",
      header: "Date",
      cell: ({ row }) => (
        <div>{moment(row.original.yarn_to_fwp_date).format("DD-MM-YYYY")}</div>
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

  const table = useReactTable({
    data: filteredRawMaterial,
    columns: rawMaterialColumns,
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
    columns: granualsColumns,
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
    columns: fabricWorkColumns,
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
      {filteredRawMaterial.length > 0 && (
        <DataTable
          title="Raw Material"
          filter={globalFilter}
          setFilter={setGlobalFilter}
          tableInstance={table}
          columnCount={rawMaterialColumns.length}
          pdf={pdf}
        />
      )}
      {filteredGranual.length > 0 && (
        <DataTable
          title="Granuals"
          filter={granualFilter}
          setFilter={setGranualFilter}
          tableInstance={tableGranual}
          columnCount={granualsColumns.length}
          pdf={pdf}
        />
      )}
      {filteredYarn.length > 0 && (
        <DataTable
          title="Yarn"
          filter={yarnFilter}
          setFilter={setYarnFilter}
          tableInstance={tableYarn}
          columnCount={yarnColumns.length}
          pdf={pdf}
        />
      )}
      {filteredFabricWork.length > 0 && (
        <DataTable
          title="Fabric"
          filter={fabricWorkFilter}
          setFilter={setFabricWorkFilter}
          tableInstance={tableFabricWork}
          columnCount={fabricWorkColumns.length}
          pdf={pdf}
        />
      )}
    </div>
  );
};

export default UnderProduction;
