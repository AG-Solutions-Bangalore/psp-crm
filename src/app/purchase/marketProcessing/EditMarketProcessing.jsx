import Page from "@/app/dashboard/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useState } from "react";
import { z } from "zod";

import { ProgressBar } from "@/components/spinner/ProgressBar";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchPurchaseProduct } from "@/hooks/useApi";
import { ChevronDown } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { decryptId } from "@/utils/encyrption/Encyrption";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

// Validation Schemas
const updateProcessingOrder = async ({ decryptedId, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-update-market-processing/${decryptedId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to update processing");
  return response.json();
};

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

const EditMarketProcessing = () => {
  const { id } = useParams();
  const decryptedId = decryptId(id);

  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    mpro_date: "",
    mpro_godown: "",
    mpro_product_name: "",
    mpro_qnty: "",
  });

  const {
    data: marketProcessingDatas,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["marketProcessing", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-market-processing-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch processing order");
      return response.json();
    },
  });
  useEffect(() => {
    if (marketProcessingDatas) {
      setFormData({
        mpro_date: marketProcessingDatas.marketProcessing.mpro_date,
        mpro_godown: marketProcessingDatas.marketProcessing.mpro_godown,
        mpro_product_name:
          marketProcessingDatas.marketProcessing.mpro_product_name,
        mpro_bag: marketProcessingDatas.marketProcessing.mpro_bag,
        mpro_qnty: marketProcessingDatas.marketProcessing.mpro_qnty,
      });
    }
  }, [marketProcessingDatas]);

  const { data: purchaseProductData } = useFetchPurchaseProduct();

  const updateProcessingMutation = useMutation({
    mutationFn: updateProcessingOrder,
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

  const fieldLabels = {
    mpro_product_name: "Product",
    mpro_bag: "Bag",
    mpro_qnty: "Quantity",
    mpro_date: " Date",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        ...formData,
      };
      updateProcessingMutation.mutate({ decryptedId, data: updateData });
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

  if (isLoading) {
    return <LoaderComponent name=" Market Processing  Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Processing   Data"
        refetch={refetch}
      />
    );
  }
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

                  <Input
                    type="text"
                    value={formData.mpro_godown}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("mpro_godown", e.target.value)
                    }
                    disabled
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="hover:bg-gray-50">
                      <TableCell className="p-2 border">
                        <div className="flex flex-col gap-2">
                          <MemoizedProductSelect
                            value={formData.mpro_product_name}
                            onChange={(value) =>
                              handleInputChange("mpro_product_name", value)
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
                          value={formData.mpro_bag}
                          onChange={(e) =>
                            handleInputChange("mpro_bag", e.target.value)
                          }
                          className="bg-white"
                          placeholder="Enter bag"
                          type="text"
                          onKeyPress={(e) => {
                            if (
                              !/[0-9.]/.test(e.key) &&
                              e.key !== "Backspace"
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="p-2 border w-40">
                        <Input
                          value={formData.mpro_qnty}
                          onChange={(e) =>
                            handleInputChange("mpro_qnty", e.target.value)
                          }
                          className="bg-white"
                          placeholder="Enter Quantity"
                          type="text"
                          onKeyPress={(e) => {
                            if (
                              !/[0-9.]/.test(e.key) &&
                              e.key !== "Backspace"
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-end">
          {updateProcessingMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={updateProcessingMutation.isPending}
          >
            {updateProcessingMutation.isPending
              ? "Submitting..."
              : "Submit Processing Order"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default EditMarketProcessing;
