import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import axios from "axios";
import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  LoaderComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

const ExcelViewer = ({ fileUrl, fileName, folderunique }) => {
  const [sheets, setSheets] = useState([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [selectedColIndex, setSelectedColIndex] = useState(null);
  const [modifiedCells, setModifiedCells] = useState({});
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    row: null,
    col: null,
    type: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const trimmedName = fileName.replace(/\.[^/.]+$/, "");

  useEffect(() => {
    const fetchExcel = async () => {
      try {
        const res = await fetch(fileUrl);
        const arrayBuffer = await res.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const parsedSheets = workbook.SheetNames.map((name) => ({
          name,
          data: XLSX.utils.sheet_to_json(workbook.Sheets[name], {
            header: 1,
            defval: "",
          }),
        }));

        setSheets(parsedSheets);
        setCurrentSheetIndex(0);
        setModifiedCells({});
      } catch (err) {
        console.error("Error reading Excel file:", err);
      }
    };

    fetchExcel();
  }, [fileUrl]);

  const updateSheetData = (newData) => {
    const updated = [...sheets];
    updated[currentSheetIndex].data = newData;
    setSheets(updated);
  };

  const handleCellChange = (ri, ci, value) => {
    const updatedData = [...sheets[currentSheetIndex].data];
    if (!updatedData[ri]) updatedData[ri] = [];
    updatedData[ri][ci] = value;
    updateSheetData(updatedData);

    setModifiedCells((prev) => ({
      ...prev,
      [currentSheetIndex]: {
        ...(prev[currentSheetIndex] || {}),
        [`${ri}-${ci}`]: true,
      },
    }));
  };

  const modifyRow = (index, type) => {
    const data = [...sheets[currentSheetIndex].data];
    const columns = data[0]?.length || 0;

    if (type === "addAbove") data.splice(index, 0, new Array(columns).fill(""));
    if (type === "addBelow")
      data.splice(index + 1, 0, new Array(columns).fill(""));
    if (type === "delete" && index !== 0) data.splice(index, 1);

    updateSheetData(data);
  };

  const modifyColumn = (index, type) => {
    const data = [...sheets[currentSheetIndex].data];

    data.forEach((row) => {
      if (type === "addLeft") row.splice(index, 0, "");
      if (type === "addRight") row.splice(index + 1, 0, "");
      if (type === "delete") row.splice(index, 1);
    });

    updateSheetData(data);
  };

  const handleSave = async () => {
    if (!folderunique || !fileName) {
      alert("Missing file or folder ID");
      return;
    }

    const workbook = XLSX.utils.book_new();
    sheets.forEach((sheet) => {
      const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    console.log(workbook, "workbook");
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const formData = new FormData();
    formData.append("file_folder_unique", folderunique);
    formData.append("file_name", blob, fileName);
    formData.append("folder_file_name", trimmedName);

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${BASE_URL}/api/panel-update-file-folder`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { code, msg } = res.data;
      toast({
        title: code === 200 ? "Success" : "Error",
        description: msg,
        variant: code === 200 ? "" : "destructive",
      });

      if (code === 200) navigate(-1, { state: { shouldRefetch: true } });
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentSheet = sheets[currentSheetIndex];
  const rows = currentSheet?.data || [];
  const headers = rows[0] || [];

  if (sheets.length === 0)
    return <WithoutLoaderComponent name="File" />;

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold">View File</h2>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className={`mt-1 sm:mt-0 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>

      <div className="flex gap-2 mb-2 flex-wrap">
        {sheets.map((sheet, idx) => (
          <button
            key={sheet.name}
            className={`px-3 py-1 rounded text-sm font-medium ${
              currentSheetIndex === idx
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setCurrentSheetIndex(idx)}
          >
            {sheet.name}
          </button>
        ))}
      </div>

      <div className="overflow-auto max-h-[calc(100vh-150px)] border rounded-md shadow bg-white">
        <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="w-12 text-center"></th>

              {headers.map((header, i) => {
                const cellKey = `0-${i}`;
                const isModified = modifiedCells[currentSheetIndex]?.[cellKey];

                return (
                  <th
                    key={i}
                    className={`relative ${isModified ? "bg-red-200" : ""}`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                        row: null,
                        col: i,
                        type: "header",
                      });
                    }}
                  >
                    <div
                      className="cursor-pointer px-2 py-1"
                      onClick={() => {
                        setSelectedColIndex(i);
                        setSelectedRowIndex(null);
                        setContextMenu({ ...contextMenu, visible: false });
                      }}
                    >
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => handleCellChange(0, i, e.target.value)}
                        className="w-full bg-transparent text-gray-400 font-medium focus:outline-none"
                      />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.slice(1).map((row, ri) => {
              const actualRow = ri + 1;
              return (
                <tr key={ri}>
                  <td className="text-center bg-gray-50 cursor-pointer even:bg-gray-200">
                    {actualRow}
                  </td>
                  {headers.map((_, ci) => {
                    const cellKey = `${actualRow}-${ci}`;
                    const isModified =
                      modifiedCells[currentSheetIndex]?.[cellKey];
                    return (
                      <td
                        key={ci}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenu({
                            visible: true,
                            x: e.clientX,
                            y: e.clientY,
                            row: actualRow,
                            col: ci,
                            type: "body",
                          });
                        }}
                        className={`border border-gray-200 px-3 py-1 ${
                          isModified ? "bg-red-200" : ""
                        }`}
                      >
                        <input
                          type="text"
                          value={
                            sheets[currentSheetIndex].data[actualRow]?.[ci] ??
                            ""
                          }
                          onChange={(e) =>
                            handleCellChange(actualRow, ci, e.target.value)
                          }
                          className="w-full bg-transparent focus:outline-none"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {contextMenu.visible && (
          <Popover
            open={contextMenu.visible}
            onOpenChange={() =>
              setContextMenu({ ...contextMenu, visible: false })
            }
          >
            <PopoverTrigger asChild>
              <div
                style={{
                  position: "fixed",
                  top: contextMenu.y,
                  left: contextMenu.x,
                  width: 1,
                  height: 1,
                }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-52 p-2 space-y-1">
              {contextMenu.type === "body" && (
                <>
                  <button
                    onClick={() => modifyRow(contextMenu.row, "addAbove")}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100"
                  >
                    ➕ Add Row Above
                  </button>
                  <button
                    onClick={() => modifyRow(contextMenu.row, "addBelow")}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100"
                  >
                    ➕ Add Row Below
                  </button>
                  <button
                    onClick={() => modifyRow(contextMenu.row, "delete")}
                    className="w-full text-left px-2 py-1 text-red-500 hover:bg-gray-100"
                  >
                    🗑️ Delete Row
                  </button>
                  <hr />
                </>
              )}
              {(contextMenu.type === "body" ||
                contextMenu.type === "header") && (
                <>
                  <button
                    onClick={() => modifyColumn(contextMenu.col, "addLeft")}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100"
                  >
                    ➕ Add Column Left
                  </button>
                  <button
                    onClick={() => modifyColumn(contextMenu.col, "addRight")}
                    className="w-full text-left px-2 py-1 hover:bg-gray-100"
                  >
                    ➕ Add Column Right
                  </button>
                  <button
                    onClick={() => modifyColumn(contextMenu.col, "delete")}
                    className="w-full text-left px-2 py-1 text-red-500 hover:bg-gray-100"
                  >
                    🗑️ Delete Column
                  </button>
                </>
              )}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </>
  );
};

export default ExcelViewer;
