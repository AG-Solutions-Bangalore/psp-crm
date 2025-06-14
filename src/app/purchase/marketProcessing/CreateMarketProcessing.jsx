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

  useFetchGoDown,

  useFetchPurchaseProduct,

} from "@/hooks/useApi";
import Page from "@/app/dashboard/page";

// Validation Schemas
const productRowSchema = z.object({
  mpro_product_name: z.string().min(1, "Product name is required"),
  mpro_bag: z.number().min(1, "bag is required"),
  mpro_qnty: z.number().min(1, "Quantity price is required"),
});

const contractFormSchema = z.object({
  mpro_date: z.string().min(1, "Purchase date is required"),
  mpro_godown: z.string().min(1, "Go Down is required"),
  processing_data: z
      .array(productRowSchema)
      .min(1, "At least one product is required"),
});
const createProcessingOrder = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
  console.log("pur data", data);
  const response = await fetch(
    `${BASE_URL}/api/panel-create-market-processing`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to create processing order");
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
const CreateMarketProcessing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [contractData, setContractData] = useState([
    {
      mpro_product_name: "",
      mpro_bag: "",
      mpro_qnty: "",
    },
  ]);

  const [formData, setFormData] = useState({
    mpro_date: getTodayDate(),
    mpro_godown: "",
  });

  const { data: goDownData } = useFetchGoDown();
  const { data: purchaseProductData } = useFetchPurchaseProduct();

  const createProcessingMutation = useMutation({
    mutationFn: createProcessingOrder,

    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/purchase/market-processing");
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
    const numericFields = ["mpro_bag", "mpro_qnty"];

    if (numericFields.includes(field)) {
      const sanitizedValue = value.replace(/[^\d.]/g, "");
      const decimalCount = (sanitizedValue.match(/\./g) || []).length;

      if (decimalCount > 1) return;

      setContractData((prev) => {
        const newData = [...prev];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [field]: sanitizedValue,
        };
        return newData;
      });
    } else {
      setContractData((prev) => {
        const newData = [...prev];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [field]: value,
        };
        return newData;
      });
    }
  }, []);

  const addRow = useCallback(() => {
    setContractData((prev) => [
      ...prev,
      {
        mpro_product_name: "",
        mpro_bag: "",
        mpro_qnty: "",
      },
    ]);
  }, []);

  const removeRow = useCallback(
    (index) => {
      if (contractData.length > 1) {
        setContractData((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [contractData.length]
  );

  const fieldLabels = {
    mpro_date: "Date",
    mpro_godown: "Go Down",
    mpro_product_name: "Product",
    mpro_bag: "Bag",
    mpro_qnty: "Quantity",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedPurchaseData = contractData.map((row) => ({
        ...row,
        mpro_bag: parseFloat(row.mpro_bag),
        mpro_qnty: parseFloat(row.mpro_qnty),
      }));

      const validatedData = contractFormSchema.parse({
        ...formData,
        processing_data: processedPurchaseData,
      });
      createProcessingMutation.mutate(validatedData);
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
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.mpro_date}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("mpro_date", e.target.value)
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
                    value={formData.mpro_godown}
                    onChange={(value) =>
                      handleSelectChange("mpro_godown", value)
                    }
                    options={
                      goDownData?.godown?.map((item) => ({
                        value: item.godown,
                        label: item.godown,
                      })) || []
                    }
                    placeholder="Select Go Down"
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-row items-center">
                  <h2 className="text-xl font-semibold">Processing Order </h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Product
                      </TableHead>

                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Bag<span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Quantity
                        <span className="text-red-500">*</span>
                      </TableHead>

                      <TableHead className="p-2 text-left border w-16">
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractData.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-gray-50">
                        <TableCell className="p-2 border">
                          <div className="flex flex-col gap-2">
                            <MemoizedProductSelect
                              value={row.mpro_product_name}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mpro_product_name",
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
                        </TableCell>

                        <TableCell className="p-2 border w-40">
                          <Input
                            value={row.mpro_bag}
                            onChange={(e) =>
                              handleRowDataChange(
                                rowIndex,
                                "mpro_bag",
                                e.target.value
                              )
                            }
                            className="bg-white"
                            placeholder="Enter bag"
                            type="text"
                          />
                        </TableCell>
                        <TableCell className="p-2 border w-40">
                          <Input
                            value={row.mpro_qnty}
                            onChange={(e) =>
                              handleRowDataChange(
                                rowIndex,
                                "mpro_qnty",
                                e.target.value
                              )
                            }
                            className="bg-white"
                            placeholder="Enter Quantity"
                            type="text"
                          />
                        </TableCell>
                        <TableCell className="p-2 border">
                          <Button
                            variant="ghost"
                            onClick={() => removeRow(rowIndex)}
                            disabled={contractData.length === 1}
                            className="text-red-500 "
                            type="button"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  onClick={addRow}
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-end">
          {createProcessingMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={createProcessingMutation.isPending}
          >
            {createProcessingMutation.isPending
              ? "Creatting..."
              : "Create Processing Order"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreateMarketProcessing;
