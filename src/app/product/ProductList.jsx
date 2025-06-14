import React, { useState } from "react";
import Page from "../dashboard/page";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";
import { useNavigate } from "react-router-dom";
import CreateProduct from "./CreateProduct";
import EditProduct from "./EditProduct";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
const ProductList = () => {
  const {
    data: products,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-product-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.product;
    },
  });

  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();

  // Define columns for the table
  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <div>{row.getValue("id")}</div>,
    },
    {
      accessorKey: "product_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Product Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("product_name")}</div>,
    },

    {
      accessorKey: "product_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("product_status");

        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              status == "Active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const productId = row.original.id;

        return (
          <div className="flex flex-row">
            <EditProduct productId={productId} />
          </div>
        );
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: products || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize: 7,
      },
    },
  });

  if (isLoading) {
    return <LoaderComponent name="Product Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent message="Error Fetching Product Data" refetch={refetch} />
    );
  }

  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Product List
        </div>
        {/* searching and column filter  */}
        <div className="flex items-center py-4">
          {/* <Input
          placeholder="Search..."
          value={table.getState().globalFilter || ""}
          onChange={(event) => {
            table.setGlobalFilter(event.target.value);
          }}
          className="max-w-sm"
        /> */}
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search Products..."
              value={table.getState().globalFilter || ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <CreateProduct />
        </div>
        {/* table  */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="text-black bg-yellow-500"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
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
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* row slection and pagintaion button  */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Total Products : &nbsp;
            {table.getFilteredRowModel().rows.length}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ProductList;
