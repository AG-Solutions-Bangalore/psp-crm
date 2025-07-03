import { RAW_MATERIAL_STOCK } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/page/page";
import downloadExcel from "@/components/common/downloadExcel";
import { ReportPageHeader } from "@/components/common/ReportPageHeader";
import {
  ErrorComponent,
  LoaderComponent,
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchItem } from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import {
  ArrowDownToLine,
  FileSpreadsheet,
  Loader,
  Printer,
} from "lucide-react";
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const RawMaterialReport = () => {
  const location = useLocation();

  const containerRef = useRef();
  const token = usetoken();
  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };
  const { toast } = useToast();
  const [printloading, setPrintLoading] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [pdf, setPdf] = useState(false);
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [formValues, setFormValues] = useState({
    fromDate: formatDate(firstDayOfMonth),
    toDate: formatDate(today),
    itemName: "",
  });
  const handleInputChange = (field, valueOrEvent) => {
    const value =
      typeof valueOrEvent === "object" && valueOrEvent.target
        ? valueOrEvent.target.value
        : valueOrEvent;

    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const fetchRawMaterialStock = async ({ queryKey }) => {
    const [_key, { from, to, token }] = queryKey;

    try {
      const response = await apiClient.get(
        `${RAW_MATERIAL_STOCK}?from=${from}&to=${to}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response?.data?.data;
    } catch (error) {
      console.error("Error fetching raw material stock:", error);
      throw error;
    }
  };

  const {
    data: rawMaterialData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "rawMaterialStock",
      {
        from: formValues.fromDate,
        to: formValues.toDate,
        token,
      },
    ],

    queryFn: fetchRawMaterialStock,
    enabled: !!token,
  });

  const { data: itemData, isLoading: loadingitem } = useFetchItem();

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Raw_Material",
    pageStyle: `
    @page {
      size: A4 portrait;
      margin: 5mm;
    }
    @media print {
      body {
        font-size: 10px;
        margin: 0mm;
        padding: 0mm;
      }
      table {
        font-size: 11px;
      }
      .print-hide {
        display: none;
      }
    }
  `,
    onBeforeGetContent: () => {
      setPrintLoading(true);
    },
    onAfterPrint: () => {
      setPrintLoading(false);
    },
    onPrintError: () => {
      setPrintLoading(false);
    },
  });
  const handleSaveAsPdf = () => {
    if (!containerRef.current) {
      console.error("Element not found");
      return;
    }

    setPdf(true);
    setPdfLoading(true);

    html2pdf()
      .from(containerRef.current)
      .set({
        margin: 10,
        filename: "Raw Material.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save()
      .then(() => {
        setPdf(false);
        setPdfLoading(false);
      })
      .catch((error) => {
        console.error("PDF export error:", error);
        setPdf(false);
        setPdfLoading(false);
      });
  };
  const downloadCSV = async (
    rawMaterialData,
    toast,
    formValues,
    setExcelLoading
  ) => {
    const filteredItems = rawMaterialData?.filter((raw) =>
      formValues?.itemName
        ? String(raw.item_id) === String(formValues.itemName)
        : true
    );

    if (!filteredItems || filteredItems.length === 0) {
      toast?.({
        title: "No Data",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    setExcelLoading(true);

    try {
      const headers = [
        "Item Name",
        "Opening Stock",
        "Received",
        "Consume",
        "Closing Stock",
      ];

      const getRowData = (item) => [
        item.item_name || "",
        Number(item.opening_stock || 0),
        Number(item.purchased || 0),
        Number(item.consumed || 0),
        Number(item.closing_stock || 0),
      ];

      const dataWithTotal = [...filteredItems];

      const customGetRowData = (item) => getRowData(item);

      await downloadExcel({
        data: dataWithTotal,
        sheetName: "Raw Material Stock",
        headers,
        getRowData: customGetRowData,
        fileNamePrefix: "raw_material_stock",
        toast,
        emptyDataCallback: () => ({
          title: "No Data",
          description: "No data available to export",
          variant: "destructive",
        }),
      });
    } catch (error) {
      toast?.({
        title: "Error",
        description: "Failed to export Excel file",
        variant: "destructive",
      });
      console.error("Excel export error:", error);
    } finally {
      setTimeout(() => {
        setExcelLoading(false);
      }, 300);
    }
  };

  const { total } = rawMaterialData
    ?.filter((raw) =>
      formValues.itemName
        ? String(raw.item_id) === String(formValues.itemName)
        : true
    )
    .reduce(
      (acc, raw) => {
        const name = raw.item_name;

        if (!acc.aggregatedData[name]) {
          acc.aggregatedData[name] = {
            item_name: name,
            opening_stock: 0,
            purchased: 0,
            consumed: 0,
            closing_stock: 0,
          };
        }

        acc.aggregatedData[name].opening_stock += Number(
          raw.opening_stock || 0
        );
        acc.aggregatedData[name].purchased += Number(raw.purchased || 0);
        acc.aggregatedData[name].consumed += Number(raw.consumed || 0);
        acc.aggregatedData[name].closing_stock += Number(
          raw.closing_stock || 0
        );

        acc.total.opening_stock += Number(raw.opening_stock || 0);
        acc.total.purchased += Number(raw.purchased || 0);
        acc.total.consumed += Number(raw.consumed || 0);
        acc.total.closing_stock += Number(raw.closing_stock || 0);

        return acc;
      },
      {
        aggregatedData: {},
        total: {
          opening_stock: 0,
          purchased: 0,
          consumed: 0,
          closing_stock: 0,
        },
      }
    ) || { aggregatedData: {}, total: {} };
  if (isLoading || loadingitem) {
    return location.pathname === "/report/raw-material" ? (
      <LoaderComponent name="Stock Data" />
    ) : (
      <WithoutLoaderComponent name="Stock Data" />
    );
  }

  if (isError) {
    return location.pathname === "/report/raw-material" ? (
      <ErrorComponent message="Error Fetching Stock Data" refetch={refetch} />
    ) : (
      <WithoutErrorComponent
        message="Error Fetching Stock Data"
        refetch={refetch}
      />
    );
  }
  const content = (
    <>
      <div>
        <ReportPageHeader
          title="Raw Material Stock"
          subtitle="View raw material stock"
          filters={[
            {
              label: "From Date",
              element: (
                <Input
                  type="date"
                  value={formValues.fromDate}
                  onChange={(e) => handleInputChange("fromDate", e)}
                  className="h-8"
                />
              ),
            },
            {
              label: "To Date",
              element: (
                <Input
                  type="date"
                  value={formValues.toDate}
                  onChange={(e) => handleInputChange("toDate", e)}
                  className="h-8"
                />
              ),
            },
            {
              label: "Item Name",
              element: (
                <Select
                  value={formValues.itemName || "all"}
                  onValueChange={(value) =>
                    handleInputChange("itemName", value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="bg-white h-8">
                    <SelectValue placeholder="All Items" />
                  </SelectTrigger>
                  <SelectContent className="bg-white max-h-60 overflow-y-auto">
                    <SelectItem value="all">All</SelectItem>
                    {itemData?.data?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.item_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ),
            },
          ]}
          actionButtons={[
            {
              title: "Print Report",
              element: (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={printloading}
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center`}
                  onClick={handlePrintPdf}
                >
                  {printloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <Printer className="h-3 w-3" />
                  )}{" "}
                  {/* Print */}
                </Button>
              ),
            },
            {
              title: "PDF Report",
              element: (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pdfloading}
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center`}
                  onClick={handleSaveAsPdf}
                >
                  {pdfloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <ArrowDownToLine className="h-3 w-3" />
                  )}{" "}
                  {/* PDF */}
                </Button>
              ),
            },
            {
              title: "Excel Report",
              element: (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={excelloading}
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center`}
                  onClick={() =>
                    downloadCSV(
                      rawMaterialData,
                      toast,
                      formValues,
                      setExcelLoading
                    )
                  }
                >
                  {excelloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <FileSpreadsheet className="h-3 w-35" />
                  )}{" "}
                  {/* Excel */}
                </Button>
              ),
            },
          ]}
        />
        <div
          className="overflow-x-auto text-[11px] grid grid-cols-1"
          ref={containerRef}
        >
          <h1
            className={`text-center text-2xl font-semibold mb-3 ${
              pdf ? "block" : "hidden"
            } print:block`}
          >
            Raw Material Stock
          </h1>

          <table className="w-full border-collapse border border-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black px-2 py-2 text-center">
                  Item Name
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Opening Stock
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Received
                </th>
                <th className="border border-black px-2 py-2 text-center cursor-pointer">
                  Consume{" "}
                </th>
                <th className="border border-black px-2 py-2 text-center cursor-pointer">
                  Closing Stock{" "}
                </th>
              </tr>
            </thead>

            <tbody>
              {rawMaterialData && rawMaterialData.length > 0 ? (
                rawMaterialData
                  .filter((raw) =>
                    formValues.itemName
                      ? String(raw.item_id) === String(formValues.itemName)
                      : true
                  )
                  .map((raw, index) => (
                    <tr
                      key={raw.item_id || index}
                      className={` ${
                        raw.closing_stock < 0 ? "bg-red-200" : ""
                      }`}
                    >
                      <td className="border border-black px-2 py-2 ">
                        {raw.item_name}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.opening_stock}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.purchased}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.consumed}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.closing_stock}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-200  font-bold">
                <td className="border border-black px-2 py-2">Total</td>
                <td className="border border-black px-2 py-2 text-right">
                  {total.opening_stock.toFixed(2)}
                </td>
                <td className="border border-black px-2 py-2 text-right">
                  {total.purchased.toFixed(2)}
                </td>
                <td className="border border-black px-2 py-2 text-right">
                  {total.consumed.toFixed(2)}
                </td>
                <td className="border border-black px-2 py-2 text-right">
                  {total.closing_stock.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
  return location.pathname == "/report/raw-material" ? (
    <Page>{content}</Page>
  ) : (
    content
  );
};

export default RawMaterialReport;
