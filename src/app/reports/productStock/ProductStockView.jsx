import React, { useRef } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import moment from "moment";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

const ProductStockView = () => {
  const { toast } = useToast();
  const location = useLocation();
  const containerRef = useRef();

  // Ensure default values to prevent undefined issues
  const formFields = location.state?.formFields || {};
  const from_date = formFields.from_date || "";
  const to_date = formFields.to_date || "";
  const godown = formFields.godown || "";

  const fetchStockData = async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await axios.post(
      `${BASE_URL}/api/panel-fetch-item-stocks-report`,
      { from_date, to_date, godown },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status !== 200) {
      throw new Error("Error fetching stock data");
    }
    return response.data;
  };

  const {
    data: stockDatas,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["stockData", from_date, to_date, godown],
    queryFn: fetchStockData,
    enabled: Boolean(from_date && to_date),
  });

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Product_Stock",
    pageStyle: `
      @page {
        size: A4 landscape;
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
  });
  console.log(stockDatas);
  if (isLoading) {
    return <LoaderComponent name="Stock Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return <ErrorComponent message="Error Stock Data" refetch={refetch} />;
  }

  return (
    <Page>
      <div className="p-4" ref={containerRef}>
        <div className="flex justify-between items-center p-2 rounded-lg mb-5 bg-gray-200">
          <h1 className="text-xl font-bold">Stock Summary</h1>
          <div className="flex flex-row items-center gap-4 font-bold">
            From - {moment(from_date).format("DD-MMM-YYYY")} To -{" "}
            {moment(to_date).format("DD-MMM-YYYY")}
            <div className="print-hide">
              {" "}
              <Button
                className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handlePrintPdf}
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-black text-[12px]">
            <thead className="bg-gray-100 text-[12px]">
              <tr>
                <th className="border border-black px-2 py-2 text-left">
                  Product Name
                </th>
                <th className="border border-black px-2 py-2 text-left">
                  Opening
                </th>
                <th className="border border-black px-2 py-2 text-left">
                  Purchase
                </th>
                <th className="border border-black px-2 py-2 text-left">
                  Production
                </th>
                <th className="border border-black px-2 py-2 text-left">
                  Processing
                </th>
                <th className="border border-black px-2 py-2 text-left">
                  Dispatch
                </th>
                <th className="border border-black px-2 py-2 text-left">
                  Closing
                </th>
              </tr>
            </thead>
            <tbody>
              {stockDatas?.stock?.map((stock, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-black px-2 py-2 ">
                    {stock.purchaseOrderProduct}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {stock.openpurch_qnty} ({stock.openpurch_bag} Bags)
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {stock.purch_qnty} ({stock.purch_bag} Bags)
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {stock.production_qnty} ({stock.production_bag} Bags)
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {stock.processing_qnty} ({stock.processing_bag} Bags)
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {stock.dispatch_qnty} ({stock.dispatch_bag} Bags)
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {stock.openpurch_qnty +
                      stock.purch_qnty +
                      stock.production_qnty +
                      stock.processing_qnty -
                      stock.dispatch_qnty}{" "}
                    (
                    {stock.openpurch_bag +
                      stock.purch_bag +
                      stock.production_bag +
                      stock.processing_bag -
                      stock.dispatch_bag}{" "}
                    Bags)
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-100">
                <td className="border border-black px-2 py-2 text-right">
                  Total:
                </td>
                <td className="border border-black text-left px-2 py-2">
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.openpurch_qnty || 0),
                    0
                  )}
                  ({" "}
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.openpurch_bag || 0),
                    0
                  )}
                  Bags)
                </td>
                <td className="border border-black text-left px-2 py-2">
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.purch_qnty || 0),
                    0
                  )}
                  ({" "}
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.purch_bag || 0),
                    0
                  )}
                  Bags)
                </td>
                <td className="border border-black text-left px-2 py-2">
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.production_qnty || 0),
                    0
                  )}
                  ({" "}
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.production_bag || 0),
                    0
                  )}
                  Bags)
                </td>
                <td className="border border-black text-left px-2 py-2">
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.processing_qnty || 0),
                    0
                  )}
                  ({" "}
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.processing_bag || 0),
                    0
                  )}
                  Bags)
                </td>
                <td className="border border-black text-left px-2 py-2">
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.dispatch_qnty || 0),
                    0
                  )}
                  ({" "}
                  {stockDatas?.stock?.reduce(
                    (sum, stock) => sum + Number(stock.dispatch_bag || 0),
                    0
                  )}
                  Bags)
                </td>
                <td className="border border-black text-left px-2 py-2">
                  {stockDatas?.stock?.reduce(
                    (sum, stock) =>
                      sum +
                      Number(
                        stock.openpurch_qnty +
                          stock.purch_qnty +
                          stock.production_qnty +
                          stock.processing_qnty -
                          stock.dispatch_qnty || 0
                      ),
                    0
                  )}
                  ({" "}
                  {stockDatas?.stock?.reduce(
                    (sum, stock) =>
                      sum +
                      Number(
                        stock.openpurch_bag +
                          stock.purch_bag +
                          stock.production_bag +
                          stock.processing_bag -
                          stock.dispatch_bag || 0
                      ),
                    0
                  )}
                  Bags)
                </td>
              </tr>{" "}
            </tfoot>
          </table>
        </div>
      </div>
    </Page>
  );
};

export default ProductStockView;
