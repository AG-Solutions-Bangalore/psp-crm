import { YARN_STOCK } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/dashboard/page";
import { ReportPageHeader } from "@/components/common/ReportPageHeader";
import { LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useFetchColor } from "@/hooks/useApi";
import { useQuery } from "@tanstack/react-query";
import { Loader, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

const YarnStockReport = () => {
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
  const [printloading, setPrintLoading] = useState(false);

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
  console.log(formValues.itemName);
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
  const { aggregatedData, total } = yarnData?.reduce(
    (acc, raw) => {
      const name = raw.item_name;

      if (!acc.aggregatedData[name]) {
        acc.aggregatedData[name] = {
          item_name: name,
          opening_stock: 0,
          incoming: 0,
          sold: 0,
          used_for_fabric: 0,
          used_for_fabric_work: 0,
          in_period: 0,
          closing_stock: 0,
        };
      }

      acc.aggregatedData[name].opening_stock += Number(raw.opening_stock || 0);
      acc.aggregatedData[name].incoming += Number(raw.incoming || 0);
      acc.aggregatedData[name].sold += Number(raw.sold || 0);
      acc.aggregatedData[name].used_for_fabric += Number(
        raw.used_for_fabric || 0
      );
      acc.aggregatedData[name].used_for_fabric_work += Number(
        raw.used_for_fabric_work || 0
      );
      acc.aggregatedData[name].in_period += Number(raw.in_period || 0);
      acc.aggregatedData[name].closing_stock += Number(raw.closing_stock || 0);

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
    return <LoaderComponent name="Yarn" />;
  }

  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Fetching Yarn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }
  return (
    <Page>
      <div className="p-0 md:p-4">
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
              element: (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={printloading}
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
                  onClick={handlePrintPdf}
                >
                  {printloading ? (
                    <Loader className="animate-spin h-3 w-3" />
                  ) : (
                    <Printer className="h-3 w-3 mr-1" />
                  )}{" "}
                  Print
                </Button>
              ),
            },
          ]}
        />
        <div
          className="overflow-x-auto text-[11px] grid grid-cols-1"
          ref={containerRef}
        >
          <h1 className="text-center text-2xl font-semibold mb-3 hidden print:block">
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
                  Period
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
                      className="hover:bg-gray-50"
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
                        {raw.in_period}
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
                  {total.in_period.toFixed(2) || ""}
                </td>
                <td className="border border-black px-2 py-2 text-right">
                  {total.closing_stock.toFixed(2) || ""}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Page>
  );
};

export default YarnStockReport;
