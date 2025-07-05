import {
  FABRIC_STOCK,
  GRANUALS_STOCK,
  RAW_MATERIAL_STOCK,
  YARN_STOCK,
} from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { WithoutLoaderComponent } from "@/components/LoaderComponent/LoaderComponent";
import { Button } from "@/components/ui/button";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useQuery } from "@tanstack/react-query";
import html2pdf from "html2pdf.js";
import { ArrowDownToLine, Loader, Printer } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import moment from "moment";
import UnderProduction from "./UnderProduction";
const SalesSummaryReport = () => {
  const fromDate = "2025-04-01";
  const token = usetoken();
  const containerRef = useRef();
  const [pdf, setPdf] = useState(false);
  const [printloading, setPrintLoading] = useState(false);
  const [pdfloading, setPdfLoading] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  }, []);

  const actualToDate = today;

  const fetchData =
    (endpoint) =>
    async ({ queryKey }) => {
      const [_key, { from, to, token }] = queryKey;
      try {
        const response = await apiClient.get(
          `${endpoint}?from=${from}&to=${to}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response?.data?.data || [];
      } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
        throw error;
      }
    };

  const { data: rawMaterialData, isLoading: loadingRaw } = useQuery({
    queryKey: ["rawMaterialStock", { from: fromDate, to: actualToDate, token }],
    queryFn: fetchData(RAW_MATERIAL_STOCK),
    enabled: !!token,
  });

  const {
    data: granualsData,
    isLoading: loadingGranuals,
    isError: errorGranuals,
  } = useQuery({
    queryKey: ["granualsStock", { from: fromDate, to: actualToDate, token }],
    queryFn: fetchData(GRANUALS_STOCK),
    enabled: !!token,
  });

  const { data: yarnData, isLoading: loadingYarn } = useQuery({
    queryKey: ["yarnStock", { from: fromDate, to: actualToDate, token }],
    queryFn: fetchData(YARN_STOCK),
    enabled: !!token,
  });
  const { data: fabricData, isLoading: fabricYarn } = useQuery({
    queryKey: ["fabricStock", { from: fromDate, to: actualToDate, token }],
    queryFn: fetchData(FABRIC_STOCK),
    enabled: !!token,
  });

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Stock Summary",
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

    setTimeout(() => {
      html2pdf()
        .from(containerRef.current)
        .set({
          margin: 10,
          filename: "Stock Summary.pdf",
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
    }, 300);
  };

  if (loadingRaw || loadingGranuals || loadingYarn || fabricYarn) {
    return <WithoutLoaderComponent name="Stock Data" />;
  }

  return (
    <div className="">
      <div
        className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="lg:w-64 xl:w-72 shrink-0">
            <h1 className="text-xl font-bold text-gray-800 truncate">
              Stock Summary
            </h1>
            <p className="text-md text-gray-500 truncate">View Stock Summary</p>
          </div>

          <div className="bg-white p-3 rounded-md shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-end gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
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
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Print</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
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
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">PDF</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
      <div ref={containerRef}>
        <div
          className={`items-center mb-3 ${
            pdf ? "flex justify-between" : "hidden"
          } print:flex justify-between`}
        >
          <h1 className="text-2xl font-semibold">Stock Summary</h1>
          <p>{moment(actualToDate).format("DD-MMM-YYYY")}</p>
        </div>

        <div className="grid grid-cols-4 gap-6 text-sm justify-center text-[12px]">
          <div>
            <div className="flex justify-center mb-2">
              <h1 className="text-[16px] font-bold">Raw Material</h1>
            </div>
            <table className="w-full border-collapse border border-black">
              <thead className="bg-gray-100 ">
                <tr>
                  <th className="border border-black  py-2 text-center font-normal w-20">
                    Item
                  </th>
                  <th className="border border-black  py-2 text-center font-normal w-20">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {rawMaterialData?.length > 0 ? (
                  rawMaterialData.map((raw, index) => (
                    <tr
                      key={raw.item_id || index}
                      className={raw.closing_stock < 0 ? "bg-red-200" : ""}
                    >
                      <td className="border border-black px-2 py-2">
                        {raw.item_name}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.closing_stock}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-bold">
                  <td className="border border-black px-2 py-2">Total</td>
                  <td className="border border-black px-2 py-2 text-right">
                    {rawMaterialData?.length > 0
                      ? rawMaterialData
                          .reduce(
                            (sum, item) =>
                              sum + (Number(item.closing_stock) || 0),
                            0
                          )
                          .toFixed(2)
                      : ""}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div>
            <div className="flex justify-center mb-2">
              <h1 className="text-[16px] font-bold">Granual</h1>
            </div>
            <table className="w-full border-collapse border border-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black  py-2 text-center font-normal w-20">
                    Color
                  </th>
                  <th className="border border-black  py-2 text-center font-normal w-20">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {granualsData?.length > 0 ? (
                  granualsData.map((raw, index) => (
                    <tr
                      key={raw.color_id || index}
                      className={raw.closing_stock < 0 ? "bg-red-200" : ""}
                    >
                      <td className="border border-black px-2 py-2">
                        {raw.color_name}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.closing_stock}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-bold">
                  <td className="border border-black px-2 py-2">Total</td>
                  <td className="border border-black px-2 py-2 text-right">
                    {granualsData?.length > 0
                      ? granualsData
                          .reduce(
                            (sum, item) =>
                              sum + (Number(item.closing_stock) || 0),
                            0
                          )
                          .toFixed(2)
                      : ""}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <h1 className="text-[16px] font-bold">Yarn</h1>
            </div>
            <table className="w-full border-collapse border border-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black  py-2 text-center font-normal w-20">
                    Color
                  </th>
                  <th className="border border-black  py-2 text-center font-normal w-20">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {yarnData?.length > 0 ? (
                  yarnData.map((raw, index) => (
                    <tr
                      key={raw.color_id || index}
                      className={raw.closing_stock < 0 ? "bg-red-200" : ""}
                    >
                      <td className="border border-black px-2 py-2">
                        {raw.color_name}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.closing_stock}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-bold">
                  <td className="border border-black px-2 py-2">Total</td>
                  <td className="border border-black px-2 py-2 text-right">
                    {yarnData?.length > 0
                      ? yarnData
                          .reduce(
                            (sum, item) =>
                              sum + (Number(item.closing_stock) || 0),
                            0
                          )
                          .toFixed(2)
                      : ""}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div>
            <div className="flex justify-center mb-2">
              <h1 className="text-[16px] font-bold">Fabric</h1>
            </div>
            <table className="w-full border-collapse border border-black">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-black font-normal w-20 py-2 text-center">
                    Color
                  </th>
                  <th className="border border-black font-normal w-20 py-2 text-center">
                    Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {fabricData?.length > 0 ? (
                  fabricData?.map((raw, index) => (
                    <tr
                      key={raw.color_id || index}
                      className={raw.close_stock < 0 ? "bg-red-200" : ""}
                    >
                      <td className="border border-black px-2 py-2">
                        {raw.color_name}
                      </td>
                      <td className="border border-black px-2 py-2 text-right">
                        {raw.close_stock}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center py-4">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="bg-gray-200 font-bold">
                  <td className="border border-black px-2 py-2">Total</td>
                  <td className="border border-black px-2 py-2 text-right">
                    {fabricData?.length > 0
                      ? fabricData

                          .reduce(
                            (sum, item) =>
                              sum + (Number(item.close_stock) || 0),
                            0
                          )
                          .toFixed(2)
                      : ""}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <UnderProduction pdf={pdf} />
      </div>
    </div>
  );
};

export default SalesSummaryReport;
