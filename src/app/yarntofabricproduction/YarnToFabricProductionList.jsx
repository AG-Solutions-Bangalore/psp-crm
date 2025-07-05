import { YARN_TO_FABRIC_PRODUCTION } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import DeleteAlertDialog from "@/components/common/DeleteAlertDialog";
import {
  WithoutErrorComponent,
  WithoutLoaderComponent,
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { getWasteLevel } from "@/routes/common/WasteLevel";
import { encryptId } from "@/utils/encyrption/Encyrption";
import { useQuery } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, Edit, Search, SquarePlus, Trash2 } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const YarnToFabricProductionList = () => {
  const token = usetoken();
  const userType = useSelector((state) => state.auth.user_type);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const { toast } = useToast();
  const {
    data: yarntofabricproduction,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["yarntofabricproduction"],
    queryFn: async () => {
      const response = await apiClient.get(`${YARN_TO_FABRIC_PRODUCTION}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
  });
  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
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
      accessorKey: "index",
      id: "Sl No",
      header: "Sl No",
      cell: ({ row }) => <div>{row.index + 1}</div>,
    },
    {
      accessorKey: "yarn_to_fp_date",
      id: "Date",
      header: "Date",
      cell: ({ row }) => {
        const date = row.getValue("Date");
        return <div>{moment(date).format("DD-MM-YYYY")}</div>;
      },
    },

    {
      accessorKey: "total_weight",
      id: "Input",
      header: "Input",
      cell: ({ row }) => <div>{row.getValue("Input")}</div>,
    },
    {
      accessorKey: "productionWeight",
      id: "Output",
      header: "Output",
      cell: ({ row }) => <div>{row.getValue("Output")}</div>,
    },

    {
      id: "Wastage",
      header: "Wastage",
      cell: ({ row }) => {
        const input = row.original.total_weight;
        const output = row.original.productionWeight;

        if (output == 0) {
          return (
            <div
              className={`rounded-full w-fit px-3 py-1 text-sm text-white ${ButtonConfig.wasteLevels.underProduction.bgColor}`}
            >
              Under Production
            </div>
          );
        }

        const waste = input - output;
        const wastePercent = input > 0 ? (waste / input) * 100 : 0;
        const efficiency = 100 - wastePercent;
        const level = getWasteLevel(
          wastePercent < 0 ? -1 : wastePercent,
          efficiency
        );
        const bgColor = ButtonConfig.wasteLevels[level].bgColor;

        return (
          <div
            className={`rounded-full w-fit px-3 py-1 text-sm text-white ${bgColor}`}
          >
            <span>{waste.toFixed(2)}</span> ({wastePercent.toFixed(0)}%)
          </div>
        );
      },
    },

    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.id;
        const output = parseFloat(row.original.productionWeight || 0);

        return (
          <div className="flex flex-row">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      navigate(
                        `/yarn-fabric-production-update/${encodeURIComponent(
                          encryptId(id)
                        )}`
                      );
                    }}
                  >
                    <Edit />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Yarn Production</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>{" "}
            {userType !== 1 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteRow(id)}
                      className="text-red-500"
                      type="button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete Yarn Production</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {output == 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigate(
                          `/fabric-from-production/${encodeURIComponent(
                            encryptId(id)
                          )}`
                        );
                      }}
                    >
                      <SquarePlus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create Yarn Production</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: yarntofabricproduction || [],
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
  const confirmDelete = async () => {
    try {
      const response = await apiClient.delete(
        `${YARN_TO_FABRIC_PRODUCTION}/${deleteItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      if (data.code == 201) {
        toast({
          title: "Success",
          description: data.message,
        });
        refetch();
      } else if (data.code == 400) {
        toast({
          title: "Duplicate Entry",
          description: data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Something went wrong.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Unexpected Error",
        description:
          error?.response?.data?.msg ||
          error.message ||
          "Something unexpected happened.",
        variant: "destructive",
      });
      console.error("Failed to delete product:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
  };
  if (isLoading) {
    return <WithoutLoaderComponent name="Yarn Production" />;
  }

  if (isError) {
    return (
      <WithoutErrorComponent
        message="Error Fetching Yarn Production"
        refetch={refetch}
      />
    );
  }

  return (
    <>
      <div className="w-full">
        <div className="flex items-center py-4">
          <div className="relative w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search Yarn Production..."
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
            className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} `}
            onClick={() => {
              navigate("/yarn-fabric-production-create");
            }}
          >
            <SquarePlus className="h-4 w-4 " /> Yarn Production
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
            Total Yarn Production: &nbsp;
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

      <DeleteAlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        description="Yarn To Fabric Production"
        handleDelete={confirmDelete}
      />
    </>
  );
};

export default YarnToFabricProductionList;
