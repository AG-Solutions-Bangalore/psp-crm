import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { flexRender } from "@tanstack/react-table";
import { ButtonConfig } from "@/config/ButtonConfig";

const DataTable = ({
  title,
  filter,
  setFilter,
  tableInstance,
  columnCount,
  pdf,
}) => {
  const rowModel = tableInstance.getRowModel();
  const headerGroups = tableInstance.getHeaderGroups();

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-xl">{title}</h1>

        <div
          className={`items-center relative w-42 gap-2 ${
            pdf ? "hidden" : "flex"
          } print:hidden`}
        >
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search Production..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-gray-200"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {headerGroups.map((headerGroup) => (
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
            {rowModel.rows?.length ? (
              rowModel.rows.map((row) => (
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
                <TableCell colSpan={columnCount} className="text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
