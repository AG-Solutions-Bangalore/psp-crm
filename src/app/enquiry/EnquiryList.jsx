import React, { useState } from "react";
import Page from "../dashboard/page";
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
  ArrowUpDown,
  ChevronDown,
  Edit,
  Eye,
  Loader2,
  Search,
  SquarePlus,
  Trash,
  UserPen,
  View,
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useToast } from "@/hooks/use-toast";
const EnquiryList = () => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteEnquiryId, setDeleteEnquiryId] = useState(null);
  const { toast } = useToast();
  const {
    data: enquiry,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["enquiry"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-enquiry-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.enquiry;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/panel-delete-enquiry/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      refetch();
      setDeleteConfirmOpen(false);
      toast({
        title: "Success",
        description: "Enquiry deleted successfully",
      });
    },
  });
  const confirmDelete = () => {
    if (deleteEnquiryId) {
      deleteMutation.mutate(deleteEnquiryId);
      setDeleteEnquiryId(null);
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
      accessorKey: "enquiry_ref",
      header: "Ref No",
      cell: ({ row }) => <div>{row.getValue("enquiry_ref")}</div>,
    },
    {
      accessorKey: "customer_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue("customer_name")}</div>,
    },
    {
      accessorKey: "branch_short",
      header: "Branch Short",
      cell: ({ row }) => <div>{row.getValue("branch_short")}</div>,
    },
    {
      accessorKey: "product_names",
      header: "Product Name",
      cell: ({ row }) => <div>{row.getValue("product_names")}</div>,
    },
    {
      accessorKey: "customer_country",
      header: "Country",
      cell: ({ row }) => <div>{row.getValue("customer_country")}</div>,
    },
    {
      accessorKey: "enquiry_date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("enquiry_date");
        return moment(date).format("DDD-MMM-YYYY");
      },
    },

   
    {
      accessorKey: "enquiry_status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("enquiry_status");
    
        const statusColors = {
          "Enquiry Received": "bg-blue-100 text-blue-800",
          "New Enquiry": "bg-green-100 text-green-800",
          "Order Cancel": "bg-red-100 text-red-800",
          "Order Closed": "bg-gray-100 text-gray-800",
          "Order Confirmed": "bg-teal-100 text-teal-800",
          "Order Delivered": "bg-purple-100 text-purple-800",
          "Order Progress": "bg-yellow-100 text-yellow-800",
          "Order Shipped": "bg-orange-100 text-orange-800",
          "Quotation": "bg-pink-100 text-pink-800",
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
        const enquiryId = row.original.id;

        return (
          <div className="flex flex-row">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/view-enquiry/${enquiryId}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>View Enquiry</TooltipContent>
            </Tooltip>
          </TooltipProvider>
  
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/edit-enquiry/${enquiryId}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit Enquiry</TooltipContent>
            </Tooltip>
          </TooltipProvider>
  
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/reply-edit-enquiry/${enquiryId}`)}
                >
                  <UserPen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reply Follow-Up</TooltipContent>
            </Tooltip>
          </TooltipProvider>
  
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDeleteEnquiryId(enquiryId);
                    setDeleteConfirmOpen(true);
                  }}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Enquiry</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        );
      },
    },
  ];

  // Create the table instance
  const table = useReactTable({
    data: enquiry || [],
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
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className=" h-4 w-4 animate-spin" />
            Loading Enquiry
          </Button>
        </div>
      </Page>
    );
  }

  // Render error state
  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Enquiry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }
  return (
    <Page>
      <div className="w-full p-4">
        <div className="flex text-left text-2xl text-gray-800 font-[400]">
          Enquiry List
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
          <Button
            variant="default"
            className="ml-2 bg-yellow-500 text-black hover:bg-yellow-100"
            onClick={() => navigate("/create-enquiries")}
          >
            <SquarePlus className="h-4 w-4" /> Enquiry
          </Button>
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
            Total Enquiry : &nbsp;
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
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              enquiry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-yellow-500 text-black hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default EnquiryList;
