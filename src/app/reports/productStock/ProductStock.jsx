import Page from "@/app/dashboard/page";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ButtonConfig } from "@/config/ButtonConfig";
import React, { useState } from "react";
import BASE_URL from "@/config/BaseUrl";
import { useFetchGoDownMarketPurchase } from "@/hooks/useApi";
import { ChevronDown } from "lucide-react";
import Select from "react-select";
import { ProductStockView } from "@/components/buttonIndex/ButtonComponents";

const createReport = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-fetch-item-stocks-report`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to create monthwise purchase report"
    );
  }
  return response.json();
};

const StockHeader = () => (
  <div
    className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between ${ButtonConfig.cardheaderColor} items-start gap-8 mb-2 p-4 shadow-sm`}
  >
    <div className="flex-1">
      <h1 className="text-3xl font-bold text-gray-800">Stock Summary</h1>
      <p className="text-gray-600 mt-2">Add a stock data to Visit Report</p>
    </div>
  </div>
);

const ProductStock = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    godown: "",
  });

  const stockReportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: (data) => {
      navigate("/report/product-stock/view", {
        state: {
          reportMoPurData: data,
          formFields: {
            from_date: formData.from_date,
            to_date: formData.to_date,
            godown: formData.godown,
          },
        },
      });
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.from_date || !formData.to_date) {
      toast({
        title: "Error",
        description: "Please fill in both dates.",
        variant: "destructive",
      });
      return;
    }
    stockReportMutation.mutate(formData);
  };
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
          borderColor: state.isFocused ? "black" : "#e5e7eb",
          boxShadow: state.isFocused ? "black" : "none",
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
          // menuPortalTarget={document.body}
          //   menuPosition="fixed"
        />
      );
    }
  );
  return (
    <Page>
      <StockHeader />

      <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
        <CardContent className="p-4">
          <div className="w-full p-4">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                  >
                    Enter From Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.from_date}
                    className="bg-white"
                    onChange={(e) => handleInputChange("from_date", e)}
                    placeholder="Enter From Date"
                  />
                </div>

                <div>
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                  >
                    Enter To Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    className="bg-white"
                    value={formData.to_date}
                    onChange={(e) => handleInputChange("to_date", e)}
                    placeholder="Enter To Date"
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[10px] font-medium `}
                  >
                    Go Down
                  </label>
                  <MemoizedSelect
                    value={formData.godown}
                    onChange={(value) => handleInputChange("godown", value)}
                    options={
                      godownPurchaseData?.godown?.map((godown) => ({
                        value: godown.godown,
                        label: godown.godown,
                      })) || []
                    }
                    placeholder="Select Go Down"
                  />
                </div>
              </div>

              <div className="flex flex-row items-end mt-3 justify-end w-full">
                <ProductStockView
                  type="submit"
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} ml-2 flex items-center`}
                  disabled={stockReportMutation.isPending}
                >
                  {stockReportMutation.isPending ? "Stock..." : "Stock Report"}
                </ProductStockView>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};

export default ProductStock;
