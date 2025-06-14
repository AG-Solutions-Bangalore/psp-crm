import Page from "@/app/dashboard/page";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchGoDownMarketPurchase } from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { z } from "zod";

// Validation Schemas

const contractFormSchema = z.object({
  mpr_date: z.string().min(1, "Date is required"),
  mpr_godown: z.string().min(1, "Go Down is required"),
  mpr_product_name: z.string().min(1, "Product Name is required"),
  mpr_bag: z.number().min(1, "Quantity is required"),
  mpr_qnty: z.number().min(1, "Quantity is required"),
});
const updateProductionOrder = async ({ decryptedId, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-update-market-production/${decryptedId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to update contract");
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

const EditMarketProduction = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const decryptedId = decryptId(id);

  const [formData, setFormData] = useState({
    mpr_date: "",
    mpr_godown: "",
    mpr_product_name: "",
    mpr_bag: "",
    mpr_qnty: "",
  });

  const { data: godownPurchaseData } = useFetchGoDownMarketPurchase();
  const {
    data: MarketProductionData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["marketproduction", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-market-production-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch Market data");
      return response.json();
    },
  });

  useEffect(() => {
    if (MarketProductionData) {
      setFormData(MarketProductionData.marketproduction);
    }
  }, [MarketProductionData]);

  const updatePurchaseMutation = useMutation({
    mutationFn: updateProductionOrder,

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
    // console.log("Field:", field, "Value:", value, "Type:", typeof value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      const validatedData = contractFormSchema.parse({
        ...formData,
        mpr_bag: parseFloat(formData.mpr_bag),
        mpr_qnty: parseFloat(formData.mpr_qnty),
      });
      updatePurchaseMutation.mutate({ data: validatedData, decryptedId });
    } catch (error) {
      console.error("Caught error:", error);
      console.log("Error name:", error.name);
      console.log("Instance of ZodError:", error instanceof z.ZodError);

      if (error instanceof z.ZodError) {
        console.log("Handling ZodError...");

        const groupedErrors = error.errors.reduce((acc, err) => {
          const field = err.path.join(".");
          if (!acc[field]) acc[field] = [];
          acc[field].push(err.message);
          return acc;
        }, {});

        console.log("Grouped errors:", groupedErrors);
        const errorMessages = Object.entries(groupedErrors).map(
          ([field, messages]) => {
            const fieldKey = field.split(".").pop();
            const label = fieldLabels?.[fieldKey] || field;
            return `${label}: ${messages.join(", ")}`;
          }
        );

        console.log("Error messages:", errorMessages);

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

        return; // Ensure it stops execution
      }

      console.log("Unexpected error block executed");

      toast({
        title: "Validation Error",
        description: errorMessages.join("\n"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoaderComponent name=" Market Production  Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Market Production   Data"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-3">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.mpr_product_name}
                    // onChange={(value) =>
                    //   handleSelectChange("mpr_product_name", value)
                    // }
                    onChange={(e) =>
                      handleSelectChange(
                        "mpr_product_name",
                        e.target.value ? String(e.target.value) : ""
                      )
                    }
                    placeholder="Select Product Name"
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Bag <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.mpr_bag}
                    // onChange={(value) => handleSelectChange("mpr_bag", value)}
                    onChange={(e) =>
                      handleSelectChange("mpr_bag", e.target.value)
                    }
                    placeholder="Enter Bag"
                    type="text"
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <Input
                    className="bg-white"
                    value={formData.mpr_qnty}
                    onChange={(e) =>
                      handleSelectChange("mpr_qnty", e.target.value)
                    }
                    placeholder="Enter Quantity"
                    type="text"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 mt-3"></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-end">
          {updateProductionOrder.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={updateProductionOrder.isPending}
          >
            {updateProductionOrder.isPending
              ? "Updatting..."
              : "Update Production Order"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default EditMarketProduction;
