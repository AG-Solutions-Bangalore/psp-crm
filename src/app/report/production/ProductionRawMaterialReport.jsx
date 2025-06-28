/* eslint-disable no-unused-vars */
import { RAW_MATERIAL_PRODUCTION_REPORT } from "@/api";
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

const ProductionRawMaterialReport = () => {
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

  const { data: rawMaterialData, isLoading } = useQuery({
    queryKey: ["rawMaterialData", searchParams],
    queryFn: async () => {
      if (!searchParams) return { data: [] };

      try {
        const response = await apiClient.post(
          RAW_MATERIAL_PRODUCTION_REPORT,
          { from_date: searchParams.fromDate, to_date: searchParams.toDate },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching raw material production report:", error);
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

  const rawMaterialProductionData = rawMaterialData?.data || [];

  const groupByMonth = () => {
    const grouped = {};
    rawMaterialProductionData.forEach(item => {
      const date = new Date(item.raw_material_to_p_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(item);
    });
    return grouped;
  };

  const groupByItem = () => {
    const grouped = {};
    rawMaterialProductionData.forEach(item => {
      const itemName = item.item || 'Unknown Item';
      if (!grouped[itemName]) {
        grouped[itemName] = [];
      }
      grouped[itemName].push(item);
    });
    return grouped;
  };

  const calculateTotals = (data) => {
    return data.reduce((acc, item) => {
      acc.totalWeight += Number(item.raw_material_sub_to_p_weight || 0);
      return acc;
    }, { totalWeight: 0 });
  };

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Raw Material Production Report",
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
      "Production Date",
      "Item",
      "Weight"
    ];

    // Calculate total weight
    const totalWeight = data.reduce((sum, item) => {
      return sum + Number(item.raw_material_sub_to_p_weight || 0);
    }, 0);

    const getRowData = (item) => [
      moment(item.raw_material_to_p_date).format("DD-MM-YYYY"),
      item.item || "",
      Number(item.raw_material_sub_to_p_weight || 0).toFixed(2)
    ];

    // Prepare data with total row
    const excelData = [
      { values: headers }, // Header row
      ...data.map(item => ({ values: getRowData(item) })),
      { 
        isFooter: true,
        values: [
          "TOTAL",
          "",
          totalWeight.toFixed(2)
        ] 
      }
    ];

    await downloadExcelMultiRow({
      data: excelData,
      sheetName: "Raw Material Production Report",
      fileNamePrefix: "raw_material_production_report",
      toast,
      customFormat: true, // Enable custom formatting for footer
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

  Object.entries(monthlyData).forEach(([month, items]) => {
    allData.push({
      isHeader: true,
      values: [new Date(`${month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })]
    });
    
    allData.push({
      values: [
        "Production Date",
        "Item",
        "Weight"
      ]
    });

    items.forEach(item => {
      allData.push({
        values: [
          moment(item.raw_material_to_p_date).format("DD-MM-YYYY"),
          item.item || "",
          Number(item.raw_material_sub_to_p_weight || 0).toFixed(2)
        ]
      });
    });

    const monthTotals = calculateTotals(items);
    grandTotalWeight += monthTotals.totalWeight;
    
    allData.push({
      isFooter: true,
      values: [
        "Monthly Total",
        "",
        monthTotals.totalWeight.toFixed(2)
      ]
    });

    allData.push({ values: [] }); // Empty row between months
  });

  // Add Grand Total at the end
  if (Object.keys(monthlyData).length > 0) {
    allData.push({
      isFooter: true,
      values: [
        "GRAND TOTAL",
        "",
        grandTotalWeight.toFixed(2)
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
      sheetName: "Monthwise Raw Material Production",
      fileNamePrefix: "monthwise_raw_material_production",
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

const downloadItemwiseCSV = async (itemData, toast, setExcelLoading) => {
  const allData = [];
  let grandTotalWeight = 0;

  Object.entries(itemData).forEach(([itemName, items]) => {
    allData.push({
      isHeader: true,
      values: [itemName]
    });
    
    allData.push({
      values: [
        "Production Date",
        "Weight"
      ]
    });

    items.forEach(item => {
      allData.push({
        values: [
          moment(item.raw_material_to_p_date).format("DD-MM-YYYY"),
          Number(item.raw_material_sub_to_p_weight || 0).toFixed(2)
        ]
      });
    });

    const itemTotals = calculateTotals(items);
    grandTotalWeight += itemTotals.totalWeight;
    
    allData.push({
      isFooter: true,
      values: [
        "Item Total",
        itemTotals.totalWeight.toFixed(2)
      ]
    });

    allData.push({ values: [] }); // Empty row between items
  });

  // Add Grand Total at the end
  if (Object.keys(itemData).length > 0) {
    allData.push({
      isFooter: true,
      values: [
        "GRAND TOTAL",
        grandTotalWeight.toFixed(2)
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
      sheetName: "Itemwise Raw Material Production",
      fileNamePrefix: "itemwise_raw_material_production",
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
  const itemData = groupByItem();
  const allTotals = calculateTotals(rawMaterialProductionData);

  return (
    <Page>
      <div className="w-full p-0 md:p-0">
        <div className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Title Section */}
            <div className="w-[30%] shrink-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">Raw Material Production Report</h1>
              <p className="text-xs text-gray-600">View raw material production data</p>
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
              <TabsTrigger value="itemwise">Itemwise</TabsTrigger>
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
                  onClick={() => downloadAllCSV(rawMaterialProductionData, toast, setExcelLoading)}
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
                  Raw Material Production Report
                </h1>
                <table className="w-full border-collapse border border-black">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-black px-2 py-2 text-center">Production Date</th>
                      <th className="border border-black px-2 py-2 text-center">Item</th>
                      <th className="border border-black px-2 py-2 text-center">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawMaterialProductionData.length > 0 ? (
                      rawMaterialProductionData.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-black px-2 py-2">{moment(item.raw_material_to_p_date).format("DD-MM-YYYY")}</td>
                          <td className="border border-black px-2 py-2">{item.item}</td>
                          <td className="border border-black px-2 py-2 text-right">{Number(item.raw_material_sub_to_p_weight || 0).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-4">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-200 font-bold">
                      <td className="border border-black px-2 py-2" colSpan="2">Total</td>
                      <td className="border border-black px-2 py-2 text-right">{allTotals.totalWeight.toFixed(2)}</td>
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
                  Raw Material Production Report (Monthwise)
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
                              <th className="border border-black px-2 py-2 text-center">Production Date</th>
                              <th className="border border-black px-2 py-2 text-center">Item</th>
                              <th className="border border-black px-2 py-2 text-center">Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={`${month}-${index}`} className="hover:bg-gray-50">
                                <td className="border border-black px-2 py-2">{moment(item.raw_material_to_p_date).format("DD-MM-YYYY")}</td>
                                <td className="border border-black px-2 py-2">{item.item}</td>
                                <td className="border border-black px-2 py-2 text-right">{Number(item.raw_material_sub_to_p_weight || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-100 font-bold">
                              <td className="border border-black px-2 py-2" colSpan="2">Monthly Total</td>
                              <td className="border border-black px-2 py-2 text-right">{monthTotals.totalWeight.toFixed(2)}</td>
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
                        <td className="border border-black px-2 py-2" colSpan="2">Grand Total</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.totalWeight.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </TabsContent>

            <TabsContent value="itemwise">
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
                  onClick={() => downloadItemwiseCSV(itemData, toast, setExcelLoading)}
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
                  Raw Material Production Report (Itemwise)
                </h1>
                {Object.keys(itemData).length > 0 ? (
                  Object.entries(itemData).map(([itemName, items]) => {
                    const itemTotals = calculateTotals(items);
                    return (
                      <div key={itemName} className="mb-6 border-t mt-6 border-l border-r border-black">
                        <h2 className="p-2 bg-gray-200 font-bold">
                          {itemName}
                        </h2>
                        <table className="w-full border-collapse">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="border border-black px-2 py-2 text-center">Production Date</th>
                              <th className="border border-black px-2 py-2 text-center">Weight</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={`${itemName}-${index}`} className="hover:bg-gray-50">
                                <td className="border border-black px-2 py-2">{moment(item.raw_material_to_p_date).format("DD-MM-YYYY")}</td>
                                <td className="border border-black px-2 py-2 text-right">{Number(item.raw_material_sub_to_p_weight || 0).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gray-100 font-bold">
                              <td className="border border-black px-2 py-2">Item Total</td>
                              <td className="border border-black px-2 py-2 text-right">{itemTotals.totalWeight.toFixed(2)}</td>
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
                {Object.keys(itemData).length > 0 && (
                  <table className="w-full border-collapse border border-black mt-4">
                    <tfoot>
                      <tr className="bg-gray-200 font-bold">
                        <td className="border border-black px-2 py-2">Grand Total</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.totalWeight.toFixed(2)}</td>
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

export default ProductionRawMaterialReport;