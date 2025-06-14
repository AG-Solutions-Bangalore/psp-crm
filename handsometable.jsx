import React, { useRef, useEffect, useState } from "react";
import { HotTable } from "@handsontable/react";
import Handsontable from "handsontable";
import * as XLSX from "xlsx";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import "handsontable/dist/handsontable.full.min.css";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Button } from "@/components/ui/button";
import Page from "@/app/dashboard/page";
import { Loader2 } from "lucide-react";

const ExcelLikeEditor = ({ fileUrl, fileName, folderunique }) => {
  const [isLoading, setIsLoading] = useState(false);
  const trimmedName = fileName.replace(/\.[^/.]+$/, "");
  const hotRef = useRef(null);
  const [data, setData] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0); // currently viewed sheet

  const { toast } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchExcel = async () => {
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const allSheets = workbook.SheetNames.map((name) => ({
        name,
        data: XLSX.utils.sheet_to_json(workbook.Sheets[name], {
          header: 1,
          defval: "",
        }),
      }));

      setSheets(allSheets);
      setData(allSheets[0].data);
      setCurrentSheetIndex(0);
    };

    fetchExcel();
  }, [fileUrl]);

  const handleSave = async () => {
    if (!folderunique || !fileName) {
      alert("Missing file or folder ID");
      return;
    }

    const hotInstance = hotRef.current?.hotInstance;
    const updatedCurrentSheet = hotInstance.getData();

    const updatedSheets = sheets.map((sheet, idx) =>
      idx === currentSheetIndex
        ? { ...sheet, data: updatedCurrentSheet }
        : sheet
    );

    const workbook = XLSX.utils.book_new();
    updatedSheets.forEach((sheet) => {
      const worksheet = XLSX.utils.aoa_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
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
      const response = await axios.post(
        `${BASE_URL}/api/panel-update-file-folder`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.data.code === 200) {
        toast({
          title: "Success",
          description: response.data.msg,
        });
        navigate(-1, { state: { shouldRefetch: true } });
      } else {
        toast({
          title: "Error",
          description: response.data.msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload file",
        variant: "destructive",
      });
      setIsLoading(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Page>
      <div className="p-2 sm:p-4">
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
        <div className="flex gap-2 mb-2">
          {sheets.map((sheet, idx) => (
            <button
              key={sheet.name}
              className={`px-3 py-1 rounded ${
                currentSheetIndex === idx
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => {
                const hotInstance = hotRef.current?.hotInstance;
                if (hotInstance) {
                  const updatedData = hotInstance.getData();
                  setSheets((prev) =>
                    prev.map((sheet, sIdx) =>
                      sIdx === currentSheetIndex
                        ? { ...sheet, data: updatedData }
                        : sheet
                    )
                  );
                }
                setCurrentSheetIndex(idx);
                setData(sheets[idx].data);
              }}
            >
              {sheet.name}
            </button>
          ))}
        </div>

        <div className="w-full overflow-auto max-h-[calc(100vh-150px)] border rounded bg-gray-50 shadow-inner">
          <div>
            <HotTable
              ref={hotRef}
              data={data}
              colHeaders={true}
              rowHeaders={true}
              licenseKey="non-commercial-and-evaluation"
              width="100%"
              height="600"
              stretchH="all"
              className="border"
              manualColumnResize={true}
              manualRowResize={true}
              contextMenu={true}
              dropdownMenu={true}
              //   fixedRowsTop={1}
              //   fixedColumnsLeft={1}
            />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ExcelLikeEditor;
