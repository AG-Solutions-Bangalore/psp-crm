import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
  ChevronDown,
  Edit,
  Eye,
  Loader2,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import Page from "@/app/dashboard/page";
import {
  PurchaseCreate,
  PurchaseEdit,
} from "@/components/buttonIndex/ButtonComponents";
import { encryptId } from "@/utils/encyrption/Encyrption";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
const MarketPurchase = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteContractId, setDeleteContractId] = useState(null);
  const { toast } = useToast();
  const {
    data: marketPurchase,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["marketPurchase"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-market-purchase-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.marketPurchase;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/panel-delete-contract/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      refetch();
      setDeleteConfirmOpen(false);
      toast({
        title: "Success",
        description: "Contract deleted successfully",
      });
    },
  });
  const confirmDelete = () => {
    if (deleteContractId) {
      deleteMutation.mutate(deleteContractId);
      setDeleteContractId(null);
    }
  };
  // State for table management
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const navigate = useNavigate();

  // Define columns for the table
  const columns = [
    {
      accessorKey: "mp_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("mp_date");
        return moment(date).format("DD-MMM-YYYY");
      },
    },
    {
      accessorKey: "mp_bill_ref",
      header: "Ref",
      cell: ({ row }) => <div>{row.getValue("mp_bill_ref")}</div>,
    },

    {
      accessorKey: "mp_vendor_name",
      header: "Vendor Name",
      cell: ({ row }) => <div>{row.getValue("mp_vendor_name")}</div>,
    },
    {
      accessorKey: "mp_bill_value",
      header: "Bill Value",
      cell: ({ row }) => <div>{row.getValue("mp_bill_value")}</div>,
    },
    // {
    //   accessorKey: "mp_godown",
    //   header: "Go Down",
    //   cell: ({ row }) => <div>{row.getValue("mp_godown")}</div>,
    // },

    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const purchaseId = row.original.id;

        return (
          <div className="flex flex-row">
            <PurchaseEdit
              // onClick={() => navigate(`/edit-market-order/${purchaseId}`)}
              onClick={() => {
                const encryptedId = encryptId(purchaseId);

                navigate(
                  `/edit-market-order/${encodeURIComponent(encryptedId)}`
                );
              }}
            >
              <Edit className="h-4 w-4" />
            </PurchaseEdit>
          </div>
        );
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: marketPurchase || [],
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
    return <LoaderComponent name=" Market Purchase Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Market Purchase  Data"
        refetch={refetch}
      />
    );
  }
  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Market Purchase List
        </div>
        {/* searching and column filter  */}
        <div className="flex items-center py-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search market purchase..."
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
          <PurchaseCreate
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            onClick={() => navigate("/create-market-order")}
          >
            <SquarePlus className="h-4 w-4" /> Market Purchase
          </PurchaseCreate>
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
            Total Market Order : &nbsp;
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

export default MarketPurchase;
