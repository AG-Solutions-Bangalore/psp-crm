/* eslint-disable no-unused-vars */
import { SALES_FABRIC_REPORT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/page/page";

// import { ErrorComponent, LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";
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

import { useSelector } from "react-redux";
import moment from "moment";
import downloadExcelMultiRow from "@/components/common/downloadExcelMultiRow";

const SalesFabricReport = () => {
  const containerRef = useRef();
  const token = usetoken();
  const { toast } = useToast();
  const companyStateName = useSelector((state) => state.auth.companystatename);
  console.log("state",companyStateName)  // TAMIL NADU
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

  const { data: salesData, isLoading,  } = useQuery({
    queryKey: ["salesData", searchParams],
    queryFn: async () => {
      if (!searchParams) return { data: [] };

      try {
        const response = await apiClient.post(
          SALES_FABRIC_REPORT,
          { from_date: searchParams.fromDate, to_date: searchParams.toDate },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response?.data;
      } catch (error) {
        console.error("Error fetching sales report:", error);
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

  const fabricData = salesData?.data?.filter(item => item.sales_type === "Fabric") || [];

  const groupByMonth = () => {
    const grouped = {};
    fabricData.forEach(item => {
      const date = new Date(item.sales_date);
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
    fabricData.forEach(item => {
      const vendor = item.vendor_name || 'Unknown Vendor';
      if (!grouped[vendor]) {
        grouped[vendor] = [];
      }
      grouped[vendor].push(item);
    });
    return grouped;
  };
  const calculateGSTValues = (item, companyStateName) => {
    const amount = Number(item.sales_amount || 0);
    const isSameState = item.vendor_state_name === companyStateName;
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
  
    if (isSameState) {
      // If same state, show CGST and SGST, IGST = 0
      cgst = (amount * Number(item.sales_cgst || 0)) / 100;
      sgst = (amount * Number(item.sales_sgst || 0)) / 100;
    } else {
      // If different state, show IGST, CGST and SGST = 0
      igst = (amount * Number(item.sales_igst || 0)) / 100;
    }
  
    return {
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      igst: igst.toFixed(2),
      isSameState
    };
  };
  const calculateTotals = (data) => {
    return data.reduce((acc, item) => {
      const { cgst, sgst, igst } = calculateGSTValues(item, companyStateName);
      acc.quantity += Number(item.sales_quantity || 0);
      acc.amount += Number(item.sales_amount || 0);
      acc.cgst += Number(cgst);
      acc.sgst += Number(sgst);
      acc.igst += Number(igst);
      acc.total += Number(item.sales_total_amount || 0);
      return acc;
    }, { quantity: 0, amount: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
  };

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Fabric Sales Report",
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





const downloadAllCSV = async (data, toast, setExcelLoading, companyStateName) => {
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
      "Sales Date",
      "Sales No",
      "Vendor Name",
      "Vendor GST",
      "Quantity",
      "Amount",
      "CGST",
      "SGST",
      "IGST",
      "Total Amount"
    ];

    const allData = [];
    const totals = calculateTotals(data);
    
   
    allData.push({ values: headers });
    
   
    data.forEach(item => {
      const { cgst, sgst, igst } = calculateGSTValues(item, companyStateName);
      allData.push({
        values: [
          moment(item.sales_date).format("DD-MM-YYYY"),
          item.sales_no || "",
          item.vendor_name || "",
          item.vendor_gst || "-",
          Number(item.sales_quantity || 0),
          Number(item.sales_amount || 0).toFixed(2),
          cgst,
          sgst,
          igst,
          Number(item.sales_total_amount || 0).toFixed(2)
        ]
      });
    });
    
  
    allData.push({
      isFooter: true,
      values: [
        "Grand Total",
        "",
        "",
        "",
        totals.quantity,
        totals.amount.toFixed(2),
        totals.cgst.toFixed(2),
        totals.sgst.toFixed(2),
        totals.igst.toFixed(2),
        totals.total.toFixed(2)
      ]
    });

    await downloadExcelMultiRow({
      data: allData,
      sheetName: "Fabric Sales Report",
      fileNamePrefix: "fabric_sales_report",
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

const downloadMonthwiseCSV = async (monthlyData, toast, setExcelLoading, companyStateName, allTotals) => {
  const allData = [];
  Object.entries(monthlyData).forEach(([month, items]) => {
   
    allData.push({
      isHeader: true,
      values: [new Date(`${month}-01`).toLocaleString('default', { month: 'long', year: 'numeric' })]
    });
    
 
    allData.push({
      values: [
        "Sales Date",
        "Sales No",
        "Vendor Name",
        "Quantity",
        "Amount",
        "CGST",
        "SGST",
        "IGST",
        "Total Amount"
      ]
    });

    
    items.forEach(item => {
      const { cgst, sgst, igst } = calculateGSTValues(item, companyStateName);
      allData.push({
        values: [
          moment(item.sales_date).format("DD-MM-YYYY"),
          item.sales_no || "",
          item.vendor_name || "",
          Number(item.sales_quantity || 0),
          Number(item.sales_amount || 0).toFixed(2),
          cgst,
          sgst,
          igst,
          Number(item.sales_total_amount || 0).toFixed(2)
        ]
      });
    });

    
    const monthTotals = calculateTotals(items);
    allData.push({
      isFooter: true,
      values: [
        "Monthly Total",
        "",
        "",
        monthTotals.quantity,
        monthTotals.amount.toFixed(2),
        monthTotals.cgst.toFixed(2),
        monthTotals.sgst.toFixed(2),
        monthTotals.igst.toFixed(2),
        monthTotals.total.toFixed(2)
      ]
    });

   
    allData.push({ values: [] });
  });

 
  allData.push({
    isFooter: true,
    values: [
      "Grand Total",
      "",
      "",
      allTotals.quantity,
      allTotals.amount.toFixed(2),
      allTotals.cgst.toFixed(2),
      allTotals.sgst.toFixed(2),
      allTotals.igst.toFixed(2),
      allTotals.total.toFixed(2)
    ]
  });

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
      sheetName: "Monthwise Fabric Sales",
      fileNamePrefix: "monthwise_fabric_sales",
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

const downloadVendorwiseCSV = async (vendorData, toast, setExcelLoading, companyStateName, allTotals) => {
  const allData = [];
  Object.entries(vendorData).forEach(([vendor, items]) => {
    const vendorGst = items[0]?.vendor_gst || '';
    

    allData.push({
      isHeader: true,
      values: [`${vendor} ${vendorGst ? `- ${vendorGst}` : ''}`]
    });
    
   
    allData.push({
      values: [
        "Sales Date",
        "Sales No",
        "Quantity",
        "Amount",
        "CGST",
        "SGST",
        "IGST",
        "Total Amount"
      ]
    });

   
    items.forEach(item => {
      const { cgst, sgst, igst } = calculateGSTValues(item, companyStateName);
      allData.push({
        values: [
          moment(item.sales_date).format("DD-MM-YYYY"),
          item.sales_no || "",
          Number(item.sales_quantity || 0),
          Number(item.sales_amount || 0).toFixed(2),
          cgst,
          sgst,
          igst,
          Number(item.sales_total_amount || 0).toFixed(2)
        ]
      });
    });

   
    const vendorTotals = calculateTotals(items);
    allData.push({
      isFooter: true,
      values: [
        "Vendor Total",
        "",
        vendorTotals.quantity,
        vendorTotals.amount.toFixed(2),
        vendorTotals.cgst.toFixed(2),
        vendorTotals.sgst.toFixed(2),
        vendorTotals.igst.toFixed(2),
        vendorTotals.total.toFixed(2)
      ]
    });

  
    allData.push({ values: [] });
  });


  allData.push({
    isFooter: true,
    values: [
      "Grand Total",
      "",
      allTotals.quantity,
      allTotals.amount.toFixed(2),
      allTotals.cgst.toFixed(2),
      allTotals.sgst.toFixed(2),
      allTotals.igst.toFixed(2),
      allTotals.total.toFixed(2)
    ]
  });

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
      sheetName: "Vendorwise Fabric Sales",
      fileNamePrefix: "vendorwise_fabric_sales",
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
  const allTotals = calculateTotals(fabricData);
 
  return (
    <Page>
      <div className="w-full p-0 md:p-0">
    
          <div className={`sticky top-0 z-10 border border-gray-200 rounded-lg ${ButtonConfig.cardheaderColor} shadow-sm p-3 mb-2`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Title Section */}
              <div className="w-[30%] shrink-0">
                <h1 className="text-xl font-bold text-gray-800 truncate">Fabric Sales Report</h1>
                <p className="text-xs text-gray-600">View fabric sales data</p>
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
                    onClick={() => downloadAllCSV(fabricData, toast, setExcelLoading, companyStateName)}
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
                  <h1 className={`text-center text-2xl font-semibold mb-3  print:block`}>
                    Fabric Sales Report
                  </h1>
                  <table className="w-full border-collapse border border-black">
                    <thead className="bg-gray-100">
                      <tr>
                      <th className="border border-black px-2 py-2 text-center">Sales Date</th>
                        <th className="border border-black px-2 py-2 text-center">Sales No</th>
                     
                        <th className="border border-black px-2 py-2 text-center">Vendor Name</th>
                        <th className="border border-black px-2 py-2 text-center">Vendor GST</th>
                        <th className="border border-black px-2 py-2 text-center">Quantity</th>
                        <th className="border border-black px-2 py-2 text-center">Amount</th>
                        <th className="border border-black px-2 py-2 text-center">CGST </th>
                        <th className="border border-black px-2 py-2 text-center">SGST </th>
                        <th className="border border-black px-2 py-2 text-center">IGST</th>
                        <th className="border border-black px-2 py-2 text-center">Total Amount</th>
                   
                      </tr>
                    </thead>
                    <tbody>
                      {fabricData.length > 0 ? (
                       fabricData.map((item, index) => {
                        const { cgst, sgst, igst } = calculateGSTValues(item, companyStateName);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-black px-2 py-2">{moment(item.sales_date).format("DD-MM-YYYY")}</td>
                            <td className="border border-black px-2 py-2">{item.sales_no}</td>
                            <td className="border border-black px-2 py-2">{item.vendor_name}</td>
                            <td className="border border-black px-2 py-2">{item.vendor_gst}</td>
                            <td className="border border-black px-2 py-2 text-right">{item.sales_quantity}</td>
                            <td className="border border-black px-2 py-2 text-right">{Number(item.sales_amount || 0).toFixed(2)}</td>
                            <td className="border border-black px-2 py-2 text-right">{cgst}</td>
                            <td className="border border-black px-2 py-2 text-right">{sgst}</td>
                            <td className="border border-black px-2 py-2 text-right">{igst}</td>
                            <td className="border border-black px-2 py-2 text-right">{Number(item.sales_total_amount || 0).toFixed(2)}</td>
                          </tr>
                        );
                      })
                      ) : (
                        <tr>
                          <td colSpan="10" className="text-center py-4">
                            No data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-200 font-bold">
                        <td className="border border-black px-2 py-2" colSpan="4">Total</td>
                       
                        <td className="border border-black px-2 py-2 text-right">{allTotals.quantity}</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.amount.toFixed(2)}</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.cgst.toFixed(2)}</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.sgst.toFixed(2)}</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.igst.toFixed(2)}</td>
                        <td className="border border-black px-2 py-2 text-right">{allTotals.total.toFixed(2)}</td>
                     
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
      onClick={() => downloadMonthwiseCSV(monthlyData, toast, setExcelLoading, companyStateName, allTotals)}
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
    <h1 className={`text-center text-2xl font-semibold mb-3  print:block`}>
      Fabric Sales Report (Monthwise)
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
                
                  <th className="border border-black px-2 py-2 text-center">Sales Date</th>
                  <th className="border border-black px-2 py-2 text-center">Sales No</th>
                  <th className="border border-black px-2 py-2 text-center">Vendor Name</th>
                  <th className="border border-black px-2 py-2 text-center">Quantity</th>
                  <th className="border border-black px-2 py-2 text-center">Amount</th>
                  <th className="border border-black px-2 py-2 text-center">CGST</th>
                  <th className="border border-black px-2 py-2 text-center">SGST </th>
                  <th className="border border-black px-2 py-2 text-center">IGST</th>
                  <th className="border border-black px-2 py-2 text-center">Total Amount</th>
                
                </tr>
              </thead>
              <tbody>
              {items.map((item, index) => {
  const { cgst, sgst, igst } = calculateGSTValues(item, companyStateName);
  return (
    <tr key={`${month}-${index}`} className="hover:bg-gray-50">
      <td className="border border-black px-2 py-2">{moment(item.sales_date).format('DD-MM-YYYY')}</td>
      <td className="border border-black px-2 py-2">{item.sales_no}</td>
      <td className="border border-black px-2 py-2">{item.vendor_name}</td>
      <td className="border border-black px-2 py-2 text-right">{item.sales_quantity}</td>
      <td className="border border-black px-2 py-2 text-right">{Number(item.sales_amount || 0).toFixed(2)}</td>
      <td className="border border-black px-2 py-2 text-right">{cgst}</td>
      <td className="border border-black px-2 py-2 text-right">{sgst}</td>
      <td className="border border-black px-2 py-2 text-right">{igst}</td>
      <td className="border border-black px-2 py-2 text-right">{Number(item.sales_total_amount || 0).toFixed(2)}</td>
    </tr>
  );
})}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-black px-2 py-2" colSpan="3">Monthly Total</td>
                  <td className="border border-black px-2 py-2 text-right">{monthTotals.quantity}</td>
                  <td className="border border-black px-2 py-2 text-right">{monthTotals.amount.toFixed(2)}</td>
                  <td className="border border-black px-2 py-2 text-right">{monthTotals.cgst}</td>
                  <td className="border border-black px-2 py-2 text-right">{monthTotals.sgst}</td>
                  <td className="border border-black px-2 py-2 text-right">{monthTotals.igst}</td>
                  <td className="border border-black px-2 py-2 text-right">{monthTotals.total.toFixed(2)}</td>
               
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
          
            <td className="border border-black px-2 py-2" colSpan="3">Grand Total</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.quantity}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.amount.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.cgst.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.sgst.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.igst.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.total.toFixed(2)}</td>
          
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
      onClick={() => downloadVendorwiseCSV(vendorData, toast, setExcelLoading, companyStateName, allTotals)}
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
    <h1 className={`text-center text-2xl font-semibold mb-3  print:block`}>
      Fabric Sales Report (Vendorwise)
    </h1>
    {Object.keys(vendorData).length > 0 ? (
      Object.entries(vendorData).map(([vendor, items]) => {
        const vendorTotals = calculateTotals(items);
        const vendorGst = items[0]?.vendor_gst || ''; // Get GST from first item
        return (
          <div key={vendor} className="mb-6 border-t mt-6 border-l border-r border-black">
            <h2 className="p-2 bg-gray-200 font-bold">
              {vendor} {vendorGst && `- ${vendorGst}`}
            </h2>
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                
                  <th className="border border-black px-2 py-2 text-center">Sales Date</th>
                  <th className="border border-black px-2 py-2 text-center">Sales No</th>
                  <th className="border border-black px-2 py-2 text-center">Quantity</th>
                  <th className="border border-black px-2 py-2 text-center">Amount</th>
                  <th className="border border-black px-2 py-2 text-center">CGST </th>
                  <th className="border border-black px-2 py-2 text-center">SGST </th>
                  <th className="border border-black px-2 py-2 text-center">IGST </th>
                  <th className="border border-black px-2 py-2 text-center">Total Amount</th>
                </tr>
              </thead>
              <tbody>
              {items.map((item, index) => {
  const { cgst, sgst, igst } = calculateGSTValues(item, companyStateName);
  return (
    <tr key={`${vendor}-${index}`} className="hover:bg-gray-50">
      <td className="border border-black px-2 py-2">{moment(item.sales_date).format("DD-MM-YYYY")}</td>
      <td className="border border-black px-2 py-2">{item.sales_no}</td>
      <td className="border border-black px-2 py-2 text-right">{item.sales_quantity}</td>
      <td className="border border-black px-2 py-2 text-right">{Number(item.sales_amount || 0).toFixed(2)}</td>
      <td className="border border-black px-2 py-2 text-right">{cgst}</td>
      <td className="border border-black px-2 py-2 text-right">{sgst}</td>
      <td className="border border-black px-2 py-2 text-right">{igst}</td>
      <td className="border border-black px-2 py-2 text-right">{Number(item.sales_total_amount || 0).toFixed(2)}</td>
    </tr>
  );
})}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="border border-black px-2 py-2" colSpan="2">Vendor Total</td>
                  <td className="border border-black px-2 py-2 text-right">{vendorTotals.quantity}</td>
                  <td className="border border-black px-2 py-2 text-right">{vendorTotals.amount.toFixed(2)}</td>
                  <td className="border border-black px-2 py-2 text-right">{vendorTotals.cgst.toFixed(2)}</td>
                  <td className="border border-black px-2 py-2 text-right">{vendorTotals.sgst.toFixed(2)}</td>
                  <td className="border border-black px-2 py-2 text-right">{vendorTotals.igst.toFixed(2)}</td>
                  <td className="border border-black px-2 py-2 text-right">{vendorTotals.total.toFixed(2)}</td>
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
            <td className="border border-black px-2 py-2 text-right">{allTotals.quantity}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.amount.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.cgst.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.sgst.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.igst.toFixed(2)}</td>
            <td className="border border-black px-2 py-2 text-right">{allTotals.total.toFixed(2)}</td>
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

export default SalesFabricReport;