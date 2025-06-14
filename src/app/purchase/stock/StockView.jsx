import Page from "@/app/dashboard/page";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonConfig } from "@/config/ButtonConfig";
import React, { useState, useEffect } from "react";
import BASE_URL from "@/config/BaseUrl";
import { useFetchGoDownMarketPurchase } from "@/hooks/useApi";
import { ChevronDown, Loader2 } from "lucide-react";
import Select from "react-select";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

const createReport = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-fetch-item-stocks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to create monthwise purchase report"
    );
  }
  return response.json();
};

const StockView = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    godown: null,
  });
  const [stockData, setStockData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const stockReportMutation = useMutation({
    mutationFn: createReport,
    onMutate: () => setIsLoading(true),
    onSuccess: (data) => {
      setStockData(data.stock);
      setIsLoading(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field, valueOrEvent) => {
    const value =
      typeof valueOrEvent === "object" && valueOrEvent.target
        ? valueOrEvent.target.value
        : valueOrEvent;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    stockReportMutation.mutate({ godown: value });
  };
  useEffect(() => {
    if (formData.godown !== null) {
      stockReportMutation.mutate({ godown: formData.godown });
    } else {
      stockReportMutation.mutate({ godown: "" });
    }
  }, []);
  const { data: godownPurchaseData } = useFetchGoDownMarketPurchase();

  const MemoizedSelect = React.memo(
    ({ value, onChange, options, placeholder }) => {
      const selectOptions = options.map((option) => ({
        value: option.value,
        label: option.label,
      }));

      const selectedOption = selectOptions.find(
        (option) => option.value === value
      );

      const customStyles = {
        control: (provided, state) => ({
          ...provided,
          minHeight: "36px",
          borderRadius: "6px",
          borderColor: state.isFocused ? "black" : "black",
          boxShadow: state.isFocused ? "black" : "black",
          "&:hover": {
            borderColor: "none",
            cursor: "text",
          },
        }),
        option: (provided, state) => ({
          ...provided,
          fontSize: "14px",
          backgroundColor: state.isSelected
            ? "#A5D6A7"
            : state.isFocused
            ? "#f3f4f6"
            : "white",
          color: state.isSelected ? "black" : "#1f2937",
          "&:hover": {
            backgroundColor: "#EEEEEE",
            color: "black",
          },
        }),

        menu: (provided) => ({
          ...provided,
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }),
        placeholder: (provided) => ({
          ...provided,
          color: "#616161",
          fontSize: "14px",
          display: "flex",
          flexDirection: "row",
          alignItems: "start",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }),
        singleValue: (provided) => ({
          ...provided,
          color: "black",
          fontSize: "14px",
        }),
      };

      const DropdownIndicator = (props) => {
        return (
          <div {...props.innerProps}>
            <ChevronDown className="h-4 w-4 mr-3 text-gray-500" />
          </div>
        );
      };

      return (
        <Select
          value={selectedOption}
          onChange={(selected) => onChange(selected ? selected.value : "")}
          options={selectOptions}
          placeholder={placeholder}
          styles={customStyles}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator,
          }}
        />
      );
    }
  );

  return (
    <Page>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="grid grid-cols-3 gap-2 mb-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Stock Summary</h1>
        </div>
        <div>
          <MemoizedSelect
            value={formData.godown}
            onChange={(value) => handleInputChange("godown", value)}
            // options={
            //   godownPurchaseData?.godown?.map((godown) => ({
            //     value: godown.godown,
            //     label: godown.godown,
            //   })) || []
            // }
            options={[
              { value: "", label: "All" },
              ...(godownPurchaseData?.godown?.map((godown) => ({
                value: godown.godown,
                label: godown.godown,
              })) || []),
            ]}
            placeholder="Select Go Down"
          />
        </div>
        <div className="flex justify-center font-bold">
          <span className="mr-2">
            {" "}
            From - {moment().startOf("month").format("DD-MM-YYYY")}
          </span>
          To - {moment().format("DD-MM-YYYY")}
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-black text-[12px]">
          <thead className="bg-gray-100 ">
            <tr>
              <th
                className="border border-black px-2 py-2 text-left"
                colSpan="7"
              >
                Stock
              </th>
            </tr>
            <tr>
              <th className="border border-black px-2 py-2 text-left">
                Product Name
              </th>
              <th className="border border-black px-2 py-2 text-left">
                Opening Stock
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
                Closing Stock
              </th>
            </tr>
          </thead>
          <tbody>
            {stockData?.map((stock, index) => (
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
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.openpurch_qnty || 0),
                  0
                )}
                (
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.openpurch_bag || 0),
                  0
                )}
                Bags)
              </td>
              <td className="border border-black text-left px-2 py-2">
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.purch_qnty || 0),
                  0
                )}
                (
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.purch_bag || 0),
                  0
                )}
                Bags)
              </td>
              <td className="border border-black text-left px-2 py-2">
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.production_qnty || 0),
                  0
                )}
                (
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.production_bag || 0),
                  0
                )}
                Bags)
              </td>
              <td className="border border-black text-left px-2 py-2">
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.processing_qnty || 0),
                  0
                )}
                (
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.processing_bag || 0),
                  0
                )}
                Bags)
              </td>
              <td className="border border-black text-left px-2 py-2">
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.dispatch_qnty || 0),
                  0
                )}
                ({" "}
                {stockData?.reduce(
                  (sum, stock) => sum + Number(stock.dispatch_bag || 0),
                  0
                )}
                Bags)
              </td>
              <td className="border border-black text-left px-2 py-2">
                {stockData?.reduce(
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
                (
                {stockData?.reduce(
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
            </tr>
          </tfoot>
        </table>
      </div>
    </Page>
  );
};

export default StockView;
