import {
  PurchaseOrderCreate,
  PurchaseOrderEdit,
  PurchaseOrderView,
} from "@/components/buttonIndex/ButtonComponents";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
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
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { encryptId } from "@/utils/encyrption/Encyrption";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import {
  ChevronDown,
  Search
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../dashboard/page";
const PurchaseOrderList = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteContractId, setDeleteContractId] = useState(null);
  const { toast } = useToast();
  const {
    data: purchaseProducts,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["purchaseProducts"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-purchase-product-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.purchaseProduct;
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
      accessorKey: "purchase_product_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("purchase_product_date");
        return moment(date).format("DD-MMM-YYYY");
      },
    },
    {
      accessorKey: "purchase_product_ref",
      header: "Ref",
      cell: ({ row }) => <div>{row.getValue("purchase_product_ref")}</div>,
    },

    {
      accessorKey: "purchase_product_seller",
      header: "Seller",
      cell: ({ row }) => <div>{row.getValue("purchase_product_seller")}</div>,
    },
    {
      accessorKey: "purchase_product_broker",
      header: "Broker",
      cell: ({ row }) => <div>{row.getValue("purchase_product_broker")}</div>,
    },
    {
      accessorKey: "purchase_product_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("purchase_product_status");

        const statusColors = {
          Pending: "bg-blue-100 text-blue-800",
          Cancel: "bg-green-100 text-green-800",
          Close: "bg-red-100 text-red-800",
        };

        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              statusColors[status] || "bg-gray-100 text-gray-800"
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
        const purchaseId = row.original.id;

        return (
          <div className="flex flex-row">
            <PurchaseOrderView
              // onClick={() => navigate(`/view-purchase-order/${purchaseId}`)}

              onClick={() => {
                const encryptedId = encryptId(purchaseId);

                navigate(
                  `/view-purchase-order/${encodeURIComponent(encryptedId)}`
                );
              }}
            ></PurchaseOrderView>
            {/* <button onClick={() => navigate(`/test-view/${purchaseId}`)}>
              View
            </button> */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PurchaseOrderEdit
                    // onClick={() =>
                    //   navigate(`/edit-purchase-order/${purchaseId}`)
                    // }
                    onClick={() => {
                      const encryptedId = encryptId(purchaseId);

                      navigate(
                        `/edit-purchase-order/${encodeURIComponent(
                          encryptedId
                        )}`
                      );
                    }}
                  ></PurchaseOrderEdit>
                </TooltipTrigger>
                <TooltipContent>Edit Purchase</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: purchaseProducts || [],
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
    return <LoaderComponent name="Purchase Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Purchase  Data"
        refetch={refetch}
      />
    );
  }

  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Purchase Order List
        </div>
        {/* searching and column filter  */}
        <div className="flex items-center py-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search purchase order..."
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
          {/* <Button
                    variant="default"
                    className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    onClick={() => navigate("/create-purchase-order")}
                  >
                    <SquarePlus className="h-4 w-4" /> Purchase Order
                  </Button> */}
          <PurchaseOrderCreate
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            onClick={() => navigate("/create-purchase-order")}
          ></PurchaseOrderCreate>
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
            Total Purchase Order : &nbsp;
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

export default PurchaseOrderList;
