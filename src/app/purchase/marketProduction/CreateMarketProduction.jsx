import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { PlusCircle, MinusCircle, ChevronDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { getTodayDate } from "@/utils/currentDate";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import BASE_URL from "@/config/BaseUrl";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select";
import { useCurrentYear } from "@/hooks/useCurrentYear";
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  useFetchCompanys,
  useFetchGoDownMarketPurchase,
  useFetchProductNos,
  useFetchPurchaseProduct,
  useFetchVendor,
} from "@/hooks/useApi";
import Page from "@/app/dashboard/page";

// Validation Schemas
const productRowSchema = z.object({
  mpr_product_name: z.string().min(1, "Product Name is required"),
  mpr_bag: z.number().min(1, "Quantity is required"),
  mpr_qnty: z.number().min(1, "Quantity is required"),
});

const contractFormSchema = z.object({
  mpr_date: z.string().min(1, "Date is required"),
  mpr_godown: z.string().min(1, "Go Down is required"),

  production_data: z
    .array(productRowSchema)
    .min(1, "At least one product is required"),
});
const createPurchaseOrder = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
  console.log("pur data", data);
  const response = await fetch(
    `${BASE_URL}/api/panel-create-market-production`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to Market Production order");
  return response.json();
};

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
const MemoizedProductSelect = React.memo(
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
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    );
  }
);
const CreateMarketProduction = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [contractData, setContractData] = useState([
    {
      mpr_product_name: "",
      mpr_bag: "",
      mpr_qnty: "",
    },
  ]);

  const [formData, setFormData] = useState({
    mpr_date: "",
    mpr_godown: "",
  });

  const { data: godownPurchaseData } = useFetchGoDownMarketPurchase();
  const { data: purchaseProductData } = useFetchPurchaseProduct();

  const createPurchaseMutation = useMutation({
    mutationFn: createPurchaseOrder,

    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/purchase/market-production");
      } else if (response.code == 400) {
        toast({
          title: "Duplicate Entry",
          description: response.msg,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected Response",
          description: response.msg || "Something unexpected happened.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleSelectChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleRowDataChange = useCallback((rowIndex, field, value) => {
    setContractData((prev) => {
      const newData = [...prev];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [field]: value,
      };
      return newData;
    });
  }, []);

  const fieldLabels = {
    mpr_date: "Date is Required",
    mpr_godown: "Godown is Required",
    mpr_product_name: "Production Name is Required",
    mpr_bag: "Bag is Required",
    mpr_qnty: "Quantity is Required",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedMarketData = contractData.map((row) => ({
        ...row,

        // mpr_product_name: parseFloat(row.mpr_product_name),
        mpr_bag: parseFloat(row.mpr_bag),
        mpr_qnty: parseFloat(row.mpr_qnty),
      }));
      const validatedData = contractFormSchema.parse({
        ...formData,
        production_data: processedMarketData,
      });
      createPurchaseMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const groupedErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join(".");
          if (!acc[field]) acc[field] = [];
          acc[field].push(err.message);
          return acc;
        }, {});

        const errorMessages = Object.entries(groupedErrors).map(
          ([field, messages]) => {
            const fieldKey = field.split(".").pop();
            const label = fieldLabels[fieldKey] || field;
            return `${label}: ${messages.join(", ")}`;
          }
        );

        toast({
          title: "Validation Error",
          description: (
            <div>
              <ul className="list-disc pl-5">
                {errorMessages.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  return (
    <Page>
      <form
        onSubmit={handleSubmit}
        className="w-full p-4 bg-blue-50/30 rounded-lg"
      >
        <Card className={`mb-6 ${ButtonConfig.cardColor} `}>
          <CardContent className="p-6">
            {/* Basic Details Section */}
            <div className="mb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    M.P.R Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.mpr_date}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("mpr_date", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Go Down <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.mpr_godown}
                    onChange={(value) =>
                      handleSelectChange("mpr_godown", value)
                    }
                    options={
                      godownPurchaseData?.godown?.map((godown) => ({
                        value: godown.godown,
                        label: godown.godown,
                      })) || []
                    }
                    placeholder="Select Godown"
                  />
                </div>
              </div>
              {contractData.map((row, rowIndex) => (
                <div key={rowIndex}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
                    <div className="flex flex-col gap-2">
                      <MemoizedProductSelect
                        value={row.mpr_product_name}
                        onChange={(value) =>
                          handleRowDataChange(
                            rowIndex,
                            "mpr_product_name",
                            value
                          )
                        }
                        options={
                          purchaseProductData?.purchaseorderproduct?.map(
                            (item) => ({
                              value: item.purchaseOrderProduct,
                              label: item.purchaseOrderProduct,
                            })
                          ) || []
                        }
                        placeholder="Select Product"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Input
                        className="bg-white"
                        value={row.mpr_bag}
                        onChange={(e) =>
                          handleRowDataChange(
                            rowIndex,
                            "mpr_bag",
                            e.target.value
                          )
                        }
                        placeholder="Enter Packing"
                        type="text"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Input
                        className="bg-white"
                        value={row.mpr_qnty}
                        onChange={(e) =>
                          handleRowDataChange(
                            rowIndex,
                            "mpr_qnty",
                            e.target.value
                          )
                        }
                        placeholder="Enter Marking"
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-end">
          {createPurchaseMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={createPurchaseMutation.isPending}
          >
            {createPurchaseMutation.isPending
              ? "Creatting..."
              : "Create Production Order"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreateMarketProduction;
