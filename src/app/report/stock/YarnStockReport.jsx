import { YARN_STOCK } from "@/api";
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
import { useFetchColor } from "@/hooks/useApi";
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

const YarnStockReport = () => {
  const location = useLocation();

  const containerRef = useRef();
  const token = usetoken();
  const formatDate = (date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [formValues, setFormValues] = useState({
    fromDate: formatDate(firstDayOfMonth),
    toDate: formatDate(today),
    itemName: "",
  });
  const { toast } = useToast();
  const [printloading, setPrintLoading] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [pdf, setPdf] = useState(false);
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
        `${YARN_STOCK}?from=${from}&to=${to}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response?.data?.data;
    } catch (error) {
      console.error("Error fetching yarn stock:", error);
      throw error;
    }
  };

  const {
    data: yarnData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "yarnData",
      {
        from: formValues.fromDate,
        to: formValues.toDate,
        token,
      },
    ],

    queryFn: fetchRawMaterialStock,
    enabled: !!token,
  });

  const { data: colorData, isLoading: loadingitem } = useFetchColor();
  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Yarn",
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
        filename: "Yarn Stock.pdf",
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
    granualsData,
    toast,
    formValues,
    setExcelLoading
  ) => {
    const filteredItems = granualsData?.filter((raw) =>
      formValues?.itemName
        ? String(raw.color_id) === String(formValues.itemName)
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
        "Color Name",
        "Opening Stock",
        "Incoming",
        "Sold",
        "Used For Fabric",
        "Used For Fabric Work",
        "Period",
        "Closing Stock",
      ];

      const getRowData = (item) => [
        item.color_name || "",
        Number(item.opening_stock || 0),
        Number(item.incoming || 0),
        Number(item.sold || 0),
        Number(item.used_for_fabric || 0),
        Number(item.used_for_fabric_work || 0),
        Number(item.in_period || 0),
        Number(item.closing_stock || 0),
      ];

      const dataWithTotal = [...filteredItems];

      const customGetRowData = (item) => getRowData(item);

      await downloadExcel({
        data: dataWithTotal,
        sheetName: "Yarn Stock",
        headers,
        getRowData: customGetRowData,
        fileNamePrefix: "yarn_stock",
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
  const { total } = yarnData
    ?.filter((raw) =>
      formValues.itemName
        ? String(raw.color_id) === String(formValues.itemName)
        : true
    )
    .reduce(
      (acc, raw) => {
        const name = raw.color_name;

        if (!acc.aggregatedData[name]) {
          acc.aggregatedData[name] = {
            color_name: name,
            opening_stock: 0,
            incoming: 0,
            sold: 0,
            used_for_fabric: 0,
            used_for_fabric_work: 0,
            in_period: 0,
            closing_stock: 0,
          };
        }

        acc.aggregatedData[name].opening_stock += Number(
          raw.opening_stock || 0
        );
        acc.aggregatedData[name].incoming += Number(raw.incoming || 0);
        acc.aggregatedData[name].sold += Number(raw.sold || 0);
        acc.aggregatedData[name].used_for_fabric += Number(
          raw.used_for_fabric || 0
        );
        acc.aggregatedData[name].used_for_fabric_work += Number(
          raw.used_for_fabric_work || 0
        );
        acc.aggregatedData[name].in_period += Number(raw.in_period || 0);
        acc.aggregatedData[name].closing_stock += Number(
          raw.closing_stock || 0
        );

        acc.total.opening_stock += Number(raw.opening_stock || 0);
        acc.total.incoming += Number(raw.incoming || 0);
        acc.total.sold += Number(raw.sold || 0);
        acc.total.used_for_fabric += Number(raw.used_for_fabric || 0);
        acc.total.used_for_fabric_work += Number(raw.used_for_fabric_work || 0);
        acc.total.in_period += Number(raw.in_period || 0);
        acc.total.closing_stock += Number(raw.closing_stock || 0);
        return acc;
      },
      {
        aggregatedData: {},
        total: {
          opening_stock: 0,
          incoming: 0,
          sold: 0,
          used_for_fabric: 0,
          used_for_fabric_work: 0,
          in_period: 0,
          closing_stock: 0,
        },
      }
    ) || { aggregatedData: {}, total: {} };

  if (isLoading || loadingitem) {
    return location.pathname === "/report/yarn" ? (
      <LoaderComponent name="Stock Data" />
    ) : (
      <WithoutLoaderComponent name="Stock Data" />
    );
  }

  if (isError) {
    return location.pathname === "/report/yarn" ? (
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
          title="Yarn Stock"
          subtitle="View Yarn stock"
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
              label: "Item Color",
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
                    {colorData?.data?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.color}
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
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center `}
                  onClick={handlePrintPdf}
                >
                  {printloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <Printer className="h-3 w-3 " />
                  )}{" "}
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
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center `}
                  onClick={handleSaveAsPdf}
                >
                  {pdfloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <ArrowDownToLine className="h-3 w-3 " />
                  )}{" "}
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
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center `}
                  onClick={() =>
                    downloadCSV(yarnData, toast, formValues, setExcelLoading)
                  }
                >
                  {excelloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <FileSpreadsheet className="h-3 w-3 " />
                  )}{" "}
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
            Yarn Stock
          </h1>
          <table className="w-full border-collapse border border-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black px-2 py-2 text-center">
                  Color Name
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Opening Stock
                </th>
                <th className="border border-black px-2 py-2 text-center">
                  Incoming
                </th>

                <th className="border border-black px-2 py-2 text-center">
                  Sold
                </th>
                <th className="border border-black px-2 py-2 text-center cursor-pointer">
                  Used For Fabric
                </th>
                <th className="border border-black px-2 py-2 text-center cursor-pointer">
                  Used For Fabric Work
                </th>

                <th className="border border-black px-2 py-2 text-center cursor-pointer">
                  Closing Stock
                </th>
              </tr>
            </thead>

            <tbody>
              {yarnData && yarnData.length > 0 ? (
                yarnData
                  .filter((raw) =>
                    formValues.itemName
                      ? String(raw.color_id) === String(formValues.itemName)
                      : true
                  )
                  .map((raw, index) => (
                    <tr
                      key={raw.color_id || index}
                      className={` ${
                        raw.closing_stock < 0
                          ? "bg-red-200 "
                          : ""
                      }`}
                    >
                      <td className="border border-black px-2 py-2 ">
                        {raw.color_name}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.opening_stock}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.incoming}
                      </td>

                      <td className="border border-black px-2 py-2 text-right">
                        {raw.sold}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.used_for_fabric}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.used_for_fabric_work}
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
                  {total.opening_stock.toFixed(2) || ""}
                </td>
                <td className="border border-black px-2 py-2 text-right">
                  {total.incoming.toFixed(2) || ""}
                </td>
                <td className="border border-black px-2 py-2 text-right">
                  {total.sold.toFixed(2) || ""}
                </td>
                <td className="border border-black px-2 py-2 text-right">
                  {total.used_for_fabric.toFixed(2) || ""}
                </td>
                <td className="border border-black px-2 py-2 text-right">
                  {total.used_for_fabric_work.toFixed(2) || ""}
                </td>

                <td className="border border-black px-2 py-2 text-right">
                  {total.closing_stock.toFixed(2) || ""}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
  return location.pathname == "/report/yarn" ? <Page>{content}</Page> : content;
};

export default YarnStockReport;
