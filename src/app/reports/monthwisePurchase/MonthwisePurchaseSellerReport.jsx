import { useLocation } from "react-router-dom";
import Page from "@/app/dashboard/page";
import { useToast } from "@/hooks/use-toast";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import BASE_URL from "@/config/BaseUrl";
import axios from "axios";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Download, Printer } from "lucide-react";

const MonthwisePurchaseSellerReport = () => {
  const { toast } = useToast();
  const location = useLocation();
  const containerRef = useRef();
  const reportData = location.state?.reportMoPurData;
  const formFields = location.state?.formFields;
  if (!reportData || !reportData.purchaseProduct) {
    return (
      <Page>
        <p>No data available</p>
      </Page>
    );
  }

  const groupedData = reportData.purchaseProduct.reduce((acc, item) => {
    acc[item.branch_name] = acc[item.branch_name] || {};

    acc[item.branch_name][item.purchase_product_seller] =
      acc[item.branch_name][item.purchase_product_seller] || [];

    acc[item.branch_name][item.purchase_product_seller].push(item);
    return acc;
  }, {});

  const overallTotals = reportData.purchaseProduct.reduce(
    (totals, item) => {
      totals.packing += Number(item.purchase_productSub_packing || 0);
      totals.marking += Number(item.purchase_productSub_marking || 0);
      totals.quantity += Number(item.purchase_productSub_qntyInMt || 0);
      totals.rate += Number(item.purchase_productSub_rateInMt || 0);
      return totals;
    },
    { packing: 0, marking: 0, quantity: 0, rate: 0 }
  );
  const handleDownload = async () => {
    try {
      const downloadPayload = {
        from_date: formFields.from_date,
        to_date: formFields.to_date,
        branch_name: formFields.branch_name || "",
        purchase_product_seller: formFields.purchase_product_seller || "",
      };
      const response = await axios({
        url: `${BASE_URL}/api/panel-download-purchase-product-monthwise-report`,
        method: "POST",
        data: downloadPayload,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "monthwise_purchase_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Monthwise Purchase Report downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to download report",
        variant: "destructive",
      });
    }
  };
  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "apta",
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 5mm;
      }
      @media print {
        body {
          border: 0px solid #000;
          font-size: 10px; 
          margin: 0mm;
          padding: 0mm;
          min-height: 100vh;
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

  return (
    <Page>
      <div ref={containerRef}>
        <div className="flex justify-between items-center p-2 rounded-lg mb-5 bg-gray-200">
          <h1 className="text-xl font-bold">Vendor Wise Report</h1>
          <div className="flex flex-row items-center gap-4 font-bold">
            <span className="mr-2">
              {" "}
              From -{moment(formFields.from_date).format("DD-MMM-YYYY")}
            </span>
            To -{moment(formFields.to_date).format("DD-MMM-YYYY")}
            <div className="print-hide">
              <Button
                className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handlPrintPdf}
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button
                className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </div>
        <div>
          {Object.entries(groupedData).map(([branchName, sellers]) => (
            <div
              key={branchName}
              className="mb-6 border-t mt-6 border-l border-r border-black text-[11px]"
            >
              <h2 className="p-2 bg-gray-200 font-bold border-b border-t border-r border-black">
                {branchName}
              </h2>
              {Object.entries(sellers).map(([sellerName, invoices]) => (
                <div key={sellerName} className="mb-4">
                  <h3 className="p-2 px-5 bg-gray-100 font-bold border-b border-r border-black">
                    {sellerName}
                  </h3>
                  <div
                    className="grid bg-white"
                    style={{
                      gridTemplateColumns:
                        "minmax(110px, auto) minmax(90px, auto) minmax(60px, auto) minmax(100px, auto) minmax(110px, auto) minmax(110px, auto) minmax(70px, auto) minmax(100px, auto)",
                    }}
                  >
                    {/* Header */}
                    {[
                      "Po No",
                      "Po Date",
                      "Delivery Date",
                      "Product",
                      "Packing",
                      "Marking",
                      "Qnty in Mt",
                      "Rate",
                    ].map((header, idx) => (
                      <div
                        key={idx}
                        className="p-2 font-bold text-center border-b border-r border-black text-gray-900"
                      >
                        {header}
                      </div>
                    ))}

                    {/* Data Rows */}
                    {invoices.map((item, index) => (
                      <React.Fragment key={index}>
                        <div className="p-2 border-b border-r border-black">
                          {item.purchase_product_ref}
                        </div>
                        <div className="p-2 border-b border-r border-black">
                          {item.purchase_product_date
                            ? moment(item.purchase_product_date).format(
                                "DD-MM-YYYY"
                              )
                            : ""}
                        </div>
                        <div className="p-2 border-b border-r border-black">
                          {item.purchase_product_delivery_date
                            ? moment(
                                item.purchase_product_delivery_date
                              ).format("DD-MM-YYYY")
                            : ""}
                        </div>
                        <div className="p-2 border-b border-r border-black">
                          {item.purchase_productSub_name}
                        </div>
                        <div className="p-2 border-b border-r border-black text-right">
                          {item.purchase_productSub_packing}
                        </div>
                        <div className="p-2 border-b border-r border-black text-right">
                          {item.purchase_productSub_marking}
                        </div>
                        <div className="p-2 border-b border-r border-black text-right">
                          {item.purchase_productSub_qntyInMt}
                        </div>
                        <div className="p-2 border-b border-r border-black text-right">
                          {item.purchase_productSub_rateInMt}
                        </div>
                      </React.Fragment>
                    ))}

                    {/* Seller Wise Total */}
                    <div className="p-2 border-b border-black"></div>
                    <div className="p-2 border-b border-black"></div>
                    <div className="p-2 border-b border-black"></div>
                    <div className="p-2 border-b border-r border-black font-bold">
                      Sub Total
                    </div>
                    <div className="p-2 border-b border-r border-black text-right font-bold">
                      {invoices.reduce(
                        (sum, item) =>
                          sum + Number(item.purchase_productSub_packing || 0),
                        0
                      )}
                    </div>
                    <div className="p-2 border-b border-r border-black text-right font-bold">
                      {invoices.reduce(
                        (sum, item) =>
                          sum + Number(item.purchase_productSub_marking || 0),
                        0
                      )}
                    </div>
                    <div className="p-2 border-b border-r border-black text-right font-bold">
                      {invoices.reduce(
                        (sum, item) =>
                          sum + Number(item.purchase_productSub_qntyInMt || 0),
                        0
                      )}
                    </div>
                    <div className="p-2 border-b border-r border-black text-right font-bold">
                      {invoices.reduce(
                        (sum, item) =>
                          sum + Number(item.purchase_productSub_rateInMt || 0),
                        0
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Overall Grand Total */}
          <div
            className="grid bg-gray-100 border-t border-l border-r border-black font-bold text-[11px]"
            style={{
              gridTemplateColumns:
                "minmax(170px, auto) minmax(90px, auto) minmax(60px, auto) minmax(100px, auto) minmax(110px, auto) minmax(110px, auto) minmax(70px, auto) minmax(95px, auto)",
            }}
          >
            <div className="p-2 border-b border-black"></div>
            <div className="p-2 border-b border-black"></div>
            <div className="p-2 border-b border-black"></div>
            <div className="p-2 border-b border-r border-black font-bold">
              Grand Total
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.packing}
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.marking}
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.quantity}
            </div>
            <div className="p-2 border-b border-r border-black text-right">
              {overallTotals.rate}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default MonthwisePurchaseSellerReport;
