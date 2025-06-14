import Page from "@/app/dashboard/page";
import React, { useState } from "react";
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
import {
  ArrowUpDown,
  ChevronDown,
  Loader2,
  Edit,
  Search,
  SquarePlus,
} from "lucide-react";
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

import { useNavigate } from "react-router-dom";
import BASE_URL from "@/config/BaseUrl";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  BranchCreate,
  BranchEdit,
} from "@/components/buttonIndex/ButtonComponents";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

const VendorList = () => {
  const {
    data: vendors,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/vendors`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data;
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
      accessorKey: "index",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "vendor_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("vendor_name")}</div>,
    },
    {
      accessorKey: "vendor_state_name",
      header: "Vendor State",
      cell: ({ row }) => <div>{row.getValue("vendor_state_name")}</div>,
    },
    {
      accessorKey: "vendor_type",
      header: "Vendor Type",
      cell: ({ row }) => <div>{row.getValue("vendor_type")}</div>,
    },
      {
      accessorKey: "vendor_contact_name",
      header: "Vendor Contact Name",
      cell: ({ row }) => <div>{row.getValue("vendor_contact_name")}</div>,
    },
    {
      accessorKey: "vendor_contact_mobile",
      header: "Mobile",
      cell: ({ row }) => <div>{row.getValue("vendor_contact_mobile")}</div>,
    },


    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");

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
        const vendorId = row.original.id;

        return (
          <div className="flex flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      navigate(`/master/vendor/edit-vendor/${vendorId}`)
                    }
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Branch</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: vendors || [],
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

  // Render loading state
  if (isLoading) {
    return <LoaderComponent name="Vendor Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent message="Error Fetching Vendor Data" refetch={refetch} />
    );
  }

  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Vendor List
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
              placeholder="Search vendor..."
              value={table.getState().globalFilter || ""}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto ">
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

          <Button
            variant="default"
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            onClick={() => navigate("/master/vendor/create-vendor")}
          >
            <SquarePlus className="h-4 w-4" /> Vendor
          </Button>
          {/* <div>
            <BranchCreate
              className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
              onClick={() => navigate("/create-branch")}
            />
          </div> */}
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
                        className={` ${ButtonConfig.tableHeader} ${ButtonConfig.tableLabel}`}
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
            Total Vendor : &nbsp;
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

export default VendorList;
