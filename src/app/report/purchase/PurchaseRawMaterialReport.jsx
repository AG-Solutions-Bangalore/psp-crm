/* eslint-disable no-unused-vars */
import { RAW_MATERIAL_PURCHASE_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/page/page";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

import { ArrowDownToLine, FileSpreadsheet, Loader, Printer, Search } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Label } from "@/components/ui/label";
import moment from "moment";
import downloadExcelMultiRow from "@/components/common/downloadExcelMultiRow";

const PurchaseRawMaterialReport = () => {
  const containerRef = useRef();
  const token = usetoken();
  const { toast } = useToast();

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
  });
  const [activeTab, setActiveTab] = useState("all");
  const [printloading, setPrintLoading] = useState(false);
  const [excelloading, setExcelLoading] = useState(false);
  const [searchParams, setSearchParams] = useState(null);

  const handleInputChange = (field, valueOrEvent) => {
    const value = typeof valueOrEvent === "object" && valueOrEvent.target ? valueOrEvent.target.value : valueOrEvent;
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const { data: purchaseData, isLoading } = useQuery({
    queryKey: ["purchaseData", searchParams],
    queryFn: async () => {
      if (!searchParams) return { data: [] };

      try {
        const response = await apiClient.post(
          RAW_MATERIAL_PURCHASE_REPORT,
          { from_date: searchParams.fromDate, to_date: searchParams.toDate },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching purchase report:", error);
        throw error;
      }
    },
    enabled: !!token && !!searchParams,
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (searchParams && JSON.stringify(searchParams) === JSON.stringify(formValues)) {
      toast({
        title: "Same search parameters",
        description: "You're already viewing results for these search criteria",
        variant: "default",
      });
      return;
    }
    setSearchParams(formValues);
  };

  const rawMaterialData = purchaseData?.data || [];

  const groupByMonth = () => {
    const grouped = {};
    rawMaterialData.forEach(item => {
      const date = new Date(item.raw_material_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(item);
    });
    return grouped;
  };

  const groupByVendor = () => {
    const grouped = {};
    rawMaterialData.forEach(item => {
      const vendor = item.vendor_name || 'Unknown Vendor';
      if (!grouped[vendor]) {
        grouped[vendor] = [];
      }
      grouped[vendor].push(item);
    });
    return grouped;
  };

  const calculateTotals = (data) => {
    return data.reduce((acc, item) => {
      acc.totalWeight += Number(item.total_weight || 0);
      acc.totalItems += Number(item.total_items || 0);
      return acc;
    }, { totalWeight: 0, totalItems: 0 });
  };

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Raw Material Purchase Report",
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

 const downloadAllCSV = async (data, toast, setExcelLoading) => {
  if (!data || data.length === 0) {
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
      "Purchase Date",
      "Reference No",
      "Bill Ref",
      "Vendor Name",
      "Vendor GST",
      "Total Weight",
      "Total Items"
    ];


    const totals = calculateTotals(data);

    const getRowData = (item) => [
      moment(item.raw_material_date).format("DD-MM-YYYY"),
      item.raw_material_ref || "",
      item.raw_material_bill_ref || "",
      item.vendor_name || "",
      item.vendor_gst || "-",
      Number(item.total_weight || 0).toFixed(2),
      Number(item.total_items || 0)
    ];

  
    const excelData = [
      { values: headers },
      ...data.map(item => ({ values: getRowData(item) })),
      { 
        isFooter: true,
        values: [
          "TOTAL",
          "",
          "",
          "",
          "",
          totals.totalWeight.toFixed(2),
          totals.totalItems
        ] 
      }
    ];

    await downloadExcelMultiRow({
      data: excelData,
      sheetName: "Raw Material Purchase Report",
      fileNamePrefix: "raw_material_purchase_report",
      toast,
      customFormat: true,
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

const downloadMonthwiseCSV = async (monthlyData, toast, setExcelLoading) => {
  const allData = [];
  let grandTotalWeight = 0;
  let grandTotalItems = 0;

  Object.entries(monthlyData).forEach(([month, items]) => {
    allData.push({
      isHeader: true,
      values: [new Date(`${month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })]
    });
    
    allData.push({
      values: [
        "Purchase Date",
        "Vendor Name",
        "Vendor GST",
        "Bill Ref",
        "Total Weight",
        "Total Items"
      ]
    });

    items.forEach(item => {
      allData.push({
        values: [
          moment(item.raw_material_date).format("DD-MM-YYYY"),
          item.vendor_name || "",
          item.vendor_gst || "-",
          item.raw_material_bill_ref || "",
          Number(item.total_weight || 0).toFixed(2),
          Number(item.total_items || 0)
        ]
      });
    });

    const monthTotals = calculateTotals(items);
    grandTotalWeight += monthTotals.totalWeight;
    grandTotalItems += monthTotals.totalItems;
    
    allData.push({
      isFooter: true,
      values: [
        "Monthly Total",
        "",
        "",
        "",
        monthTotals.totalWeight.toFixed(2),
        monthTotals.totalItems
      ]
    });

    allData.push({ values: [] }); 
  });


  if (Object.keys(monthlyData).length > 0) {
    allData.push({
      isFooter: true,
      values: [
        "GRAND TOTAL",
        "",
        "",
        "",
        grandTotalWeight.toFixed(2),
        grandTotalItems
      ]
    });
  }

  if (allData.length === 0) {
    toast?.({
      title: "No Data",
      description: "No data available to export",
      variant: "destructive",
    });
    return;
  }

  setExcelLoading(true);

  try {
    await downloadExcelMultiRow({
      data: allData,
      sheetName: "Monthwise Purchase Report",
      fileNamePrefix: "monthwise_raw_material_purchase",
      toast,
      customFormat: true,
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

const downloadVendorwiseCSV = async (vendorData, toast, setExcelLoading) => {
  const allData = [];
  let grandTotalWeight = 0;
  let grandTotalItems = 0;

  Object.entries(vendorData).forEach(([vendor, items]) => {
    const vendorGst = items[0]?.vendor_gst || '';
    
    allData.push({
      isHeader: true,
      values: [`${vendor} ${vendorGst ? `- ${vendorGst}` : ''}`]
    });
    
    allData.push({
      values: [
        "Purchase Date",
        "Bill Ref",
        "Total Weight",
        "Total Items"
      ]
    });

    items.forEach(item => {
      allData.push({
        values: [
          moment(item.raw_material_date).format("DD-MM-YYYY"),
          item.raw_material_bill_ref || "",
          Number(item.total_weight || 0).toFixed(2),
          Number(item.total_items || 0)
        ]
      });
    });

    const vendorTotals = calculateTotals(items);
    grandTotalWeight += vendorTotals.totalWeight;
    grandTotalItems += vendorTotals.totalItems;
    
    allData.push({
      isFooter: true,
      values: [
        "Vendor Total",
        "",
        vendorTotals.totalWeight.toFixed(2),
        vendorTotals.totalItems
      ]
    });

    allData.push({ values: [] }); 
  });


  if (Object.keys(vendorData).length > 0) {
    allData.push({
      isFooter: true,
      values: [
        "GRAND TOTAL",
        "",
        grandTotalWeight.toFixed(2),
        grandTotalItems
      ]
    });
  }

  if (allData.length === 0) {
    toast?.({
      title: "No Data",
      description: "No data available to export",
      variant: "destructive",
    });
    return;
  }

  setExcelLoading(true);

  try {
    await downloadExcelMultiRow({
      data: allData,
      sheetName: "Vendorwise Purchase Report",
      fileNamePrefix: "vendorwise_raw_material_purchase",
      toast,
      customFormat: true,
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

  const monthlyData = groupByMonth();
  const vendorData = groupByVendor();
  const allTotals = calculateTotals(rawMaterialData);

  return (
    <Page>
      <div className="w-full p-0 md:p-0">
        <div className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Title Section */}
            <div className="w-[30%] shrink-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">Raw Material Purchase Report</h1>
              <p className="text-xs text-gray-600">View raw material purchase data</p>
            </div>

            {/* Form Section */}
            <div className="bg-white w-full lg:w-[70%] p-3 rounded-md shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                  {/* From Date */}
                  <div className="space-y-1">
                    <Label htmlFor="from_date" className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}>
                      From Date
                    </Label>
                    <Input
                      id="from_date"
                      type="date"
                      value={formValues.fromDate}
                      onChange={(e) => handleInputChange("fromDate", e)}
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* To Date */}
                  <div className="space-y-1">
                    <Label htmlFor="to_date" className={`text-xs ${ButtonConfig.cardLabel || "text-gray-700"}`}>
                      To Date
                    </Label>
                    <Input
                      id="to_date"
                      type="date"
                      value={formValues.toDate}
                      onChange={(e) => handleInputChange("toDate", e)}
                      className="h-8 text-xs"
                    />
                  </div>

                  {/* Generate Button */}
                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`h-8 text-xs ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="h-3 w-3 animate-spin mr-1" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Search className="h-3 w-3 mr-1" />
                          Generate
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {searchParams && (
          <Tabs defaultValue="all" className="w-full mt-4" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="monthwise">Monthwise</TabsTrigger>
              <TabsTrigger value="vendorwise">Vendorwise</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="flex justify-end gap-2 mb-2">
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
                    <Printer className="h-3 w-3 mr-1" />
                  )}
                  Print
                </Button>
               
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={excelloading}
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center`}
                  onClick={() => downloadAllCSV(rawMaterialData, toast, setExcelLoading)}
                >
                  {excelloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                  )}
                  Excel
                </Button>
              </div>
              <div className="overflow-x-auto text-[11px] grid grid-cols-1" ref={containerRef}>
                <h1 className={`text-center text-2xl font-semibold mb-3 print:block`}>
                  Raw Material Purchase Report
                </h1>
                <table className="w-full border-collapse border border-black">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-black px-2 py-2 text-center">Purchase Date</th>
              
                      <th className="border border-black px-2 py-2 text-center">Bill Ref</th>
                      <th className="border border-black px-2 py-2 text-center">Vendor Name</th>
                      <th className="border border-black px-2 py-2 text-center">Vendor GST</th>
                      <th className="border border-black px-2 py-2 text-center">Total Weight</th>
                      <th className="border border-black px-2 py-2 text-center">Total Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawMaterialData.length > 0 ? (
                      rawMaterialData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-black px-2 py-2">{moment(item.raw_material_date).format("DD-MM-YYYY")}</td>
                          
                          <td className="border border-black px-2 py-2">{item.raw_material_bill_ref}</td>
                          <td className="border border-black px-2 py-2">{item.vendor_name}</td>
                          <td className="border border-black px-2 py-2">{item.vendor_gst || "-"}</td>
                          <td className="border border-black px-2 py-2 text-right">{Number(item.total_weight || 0).toFixed(2)}</td>
                          <td className="border border-black px-2 py-2 text-right">{item.total_items}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-200 font-bold">
                      <td className="border border-black px-2 py-2" colSpan="4">Total</td>
                      <td className="border border-black px-2 py-2 text-right">{allTotals.totalWeight.toFixed(2)}</td>
                      <td className="border border-black px-2 py-2 text-right">{allTotals.totalItems}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="monthwise">
              <div className="flex justify-end gap-2 mb-2">
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
                    <Printer className="h-3 w-3 mr-1" />
                  )}
                  Print
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={excelloading}
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center`}
                  onClick={() => downloadMonthwiseCSV(monthlyData, toast, setExcelLoading)}
                >
                  {excelloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                  )}
                  Excel
                </Button>
              </div>
              <div className="overflow-x-auto text-[11px] grid grid-cols-1" ref={containerRef}>
                <h1 className={`text-center text-2xl font-semibold mb-3 print:block`}>
                  Raw Material Purchase Report (Monthwise)
                </h1>
                {Object.keys(monthlyData).length > 0 ? (
                  Object.entries(monthlyData).map(([month, items]) => {
                    const monthTotals = calculateTotals(items);
                    return (
                      <div key={month} className="mb-6 border-t mt-6 border-l border-r border-black">
                        <h2 className="p-2 bg-gray-200 font-bold">
                          {new Date(`${month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h2>
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-black px-2 py-2 text-center">Purchase Date</th>
                              <th className="border border-black px-2 py-2 text-center">Vendor Name</th>
                      <th className="border border-black px-2 py-2 text-center">Vendor GST</th>
                              <th className="border border-black px-2 py-2 text-center">Bill Ref</th>
                              <th className="border border-black px-2 py-2 text-center">Total Weight</th>
                              <th className="border border-black px-2 py-2 text-center">Total Items</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={`${month}-${index}`} className="hover:bg-gray-50">
                                <td className="border border-black px-2 py-2">{moment(item.raw_material_date).format("DD-MM-YYYY")}</td>
                                <td className="border border-black px-2 py-2">{item.vendor_name}</td>
                                <td className="border border-black px-2 py-2">{item.vendor_gst || "-"}</td>
                                <td className="border border-black px-2 py-2">{item.raw_material_bill_ref}</td>
                                <td className="border border-black px-2 py-2 text-right">{Number(item.total_weight || 0).toFixed(2)}</td>
                                <td className="border border-black px-2 py-2 text-right">{item.total_items}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-100 font-bold">
                              <td className="border border-black px-2 py-2" colSpan="4">Monthly Total</td>
                              <td className="border border-black px-2 py-2 text-right">{monthTotals.totalWeight.toFixed(2)}</td>
                              <td className="border border-black px-2 py-2 text-right">{monthTotals.totalItems}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">No data available</div>
                )}
                {/* Grand Total */}
                {Object.keys(monthlyData).length > 0 && (
                  <table className="w-full border-collapse border border-black mt-4">
                    <tfoot>
                      <tr className="bg-gray-200 font-bold">
                        <td className="border border-black px-2 py-2" colSpan="4">Grand Total</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.totalWeight.toFixed(2)}</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.totalItems}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="vendorwise">
              <div className="flex justify-end gap-2 mb-2">
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
                    <Printer className="h-3 w-3 mr-1" />
                  )}
                  Print
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={excelloading}
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center`}
                  onClick={() => downloadVendorwiseCSV(vendorData, toast, setExcelLoading)}
                >
                  {excelloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <FileSpreadsheet className="h-3 w-3 mr-1" />
                  )}
                  Excel
                </Button>
              </div>
              <div className="overflow-x-auto text-[11px] grid grid-cols-1" ref={containerRef}>
                <h1 className={`text-center text-2xl font-semibold mb-3 print:block`}>
                  Raw Material Purchase Report (Vendorwise)
                </h1>
                {Object.keys(vendorData).length > 0 ? (
                  Object.entries(vendorData).map(([vendor, items]) => {
                    const vendorTotals = calculateTotals(items);
                    const vendorGst = items[0]?.vendor_gst || '';
                    return (
                      <div key={vendor} className="mb-6 border-t mt-6 border-l border-r border-black">
                        <h2 className="p-2 bg-gray-200 font-bold">
                          {vendor} {vendorGst && `- ${vendorGst}`}
                        </h2>
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-black px-2 py-2 text-center">Purchase Date</th>
                          
                              <th className="border border-black px-2 py-2 text-center">Bill Ref</th>
                              <th className="border border-black px-2 py-2 text-center">Total Weight</th>
                              <th className="border border-black px-2 py-2 text-center">Total Items</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={`${vendor}-${index}`} className="hover:bg-gray-50">
                                <td className="border border-black px-2 py-2">{moment(item.raw_material_date).format("DD-MM-YYYY")}</td>
                          
                                <td className="border border-black px-2 py-2">{item.raw_material_bill_ref}</td>
                                <td className="border border-black px-2 py-2 text-right">{Number(item.total_weight || 0).toFixed(2)}</td>
                                <td className="border border-black px-2 py-2 text-right">{item.total_items}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-100 font-bold">
                              <td className="border border-black px-2 py-2" colSpan="2">Vendor Total</td>
                              <td className="border border-black px-2 py-2 text-right">{vendorTotals.totalWeight.toFixed(2)}</td>
                              <td className="border border-black px-2 py-2 text-right">{vendorTotals.totalItems}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">No data available</div>
                )}
                {/* Grand Total */}
                {Object.keys(vendorData).length > 0 && (
                  <table className="w-full border-collapse border border-black mt-4">
                    <tfoot>
                      <tr className="bg-gray-200 font-bold">
                        <td className="border border-black px-2 py-2" colSpan="2">Grand Total</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.totalWeight.toFixed(2)}</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.totalItems}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Page>
  );
};

export default PurchaseRawMaterialReport;