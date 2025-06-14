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
import Page from "../dashboard/page";
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
  useFetchProductNos,
  useFetchPurchaseProduct,
  useFetchVendor,
} from "@/hooks/useApi";

// Validation Schemas
const productRowSchema = z.object({
  purchase_productSub_name: z.string().min(1, "Product name is required"),
  purchase_productSub_name_hsn: z
    .string()
    .optional(),

  purchase_productSub_description: z.string().min(1, "Description is required"),
  purchase_productSub_rateInMt: z.number().min(1, "rate  is required"),
  purchase_productSub_qntyInMt: z.number().min(1, "Quantity is required"),
  purchase_productSub_packing: z.number().min(1, "Packing is required"),
  purchase_productSub_marking: z.number().min(1, "Marking price is required"),
});

const contractFormSchema = z.object({
  branch_short: z.string().min(1, "Company Sort is required"),
  branch_name: z.string().min(1, "Company Name is required"),
  branch_address: z.string().min(1, "Company Address is required"),
  purchase_product_year: z.string().optional(),
  purchase_product_date: z.string().min(1, "Product date is required"),
  purchase_product_no: z.number().min(1, "Product No is required"),
  purchase_product_ref: z.string().min(1, "Product Ref is required"),

  purchase_product_seller: z.string().min(1, "Seller Name is required"),
  purchase_product_seller_add: z.string().min(1, "Seller Address is required"),
  purchase_product_seller_gst: z.string().min(1, "gst is required"),
  purchase_product_seller_contact: z
    .string()
    .min(1, "contact is required"),

  purchase_product_broker: z.string().min(1, "Broker Name is required"),
  purchase_product_broker_add: z
    .string()
    .min(1, "Broker Address is required"),

  purchase_product_delivery_date: z
    .string()
    .optional(),
  purchase_product_delivery_at: z
    .string()
    .optional(),
  purchase_product_payment_terms: z.string().optional(),
  purchase_product_tc: z.string().optional(),
  purchase_product_gst_notification: z
    .string()
    .optional(),
  purchase_product_quality: z.string().optional(),

  purchase_product_data: z
    .array(productRowSchema)
    .min(1, "At least one product is required"),
});
const createPurchaseOrder = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");
    console.log("pur data",data)
  const response = await fetch(
    `${BASE_URL}/api/panel-create-purchase-product`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to create purchase order");
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
const CreatePurchaseOrder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [contractData, setContractData] = useState([
    {
      purchase_productSub_name: "",
      purchase_productSub_name_hsn: "",
      purchase_productSub_description: "",
      purchase_productSub_rateInMt: "",
      purchase_productSub_qntyInMt: "",
      purchase_productSub_packing: "",
      purchase_productSub_marking: "",
    },
  ]);

  const { data: currentYear } = useCurrentYear();
  useEffect(() => {
    if (currentYear) {
      setFormData((prev) => ({
        ...prev,
        purchase_product_year: currentYear,
      }));
    }
  }, [currentYear]);

  const [formData, setFormData] = useState({
    branch_short: "",
    branch_name: "",
    branch_address: "",
    purchase_product_year: currentYear,
    purchase_product_date: getTodayDate(),
    purchase_product_no: "",
    purchase_product_ref: "",
    purchase_product_seller: "",
    purchase_product_seller_add: "",
    purchase_product_seller_gst: "",
    purchase_product_seller_contact: "",
    purchase_product_broker: "",
    purchase_product_broker_add: "",
    purchase_product_delivery_date: "",
    purchase_product_delivery_at: "",
    purchase_product_payment_terms: "",
    purchase_product_tc: "",
    purchase_product_gst_notification: "",
    purchase_product_quality: "",
  });

  const { data: branchData } = useFetchCompanys();
  const { data: vendorData } = useFetchVendor();
  const { data: purchaseProductData } = useFetchPurchaseProduct();
  const { data: productNoData } = useFetchProductNos(formData.branch_short);

  const createPurchaseMutation = useMutation({
    mutationFn: createPurchaseOrder,

    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/purchase-order");
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

  const handleSelectChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

    

      if (field === "branch_short") {
        const selectedCompanySort = branchData?.branch?.find(
          (branch) => branch.branch_short === value
        );
        if (selectedCompanySort) {
          const productRef = `${selectedCompanySort.branch_name_short}/${selectedCompanySort.branch_state_short}/${formData?.purchase_product_no}/${formData.purchase_product_year}`;
          setFormData((prev) => ({
            ...prev,
            branch_name: selectedCompanySort.branch_name,
            branch_address: selectedCompanySort.branch_address,
            purchase_product_ref: productRef,
          }));
        }
      }

      if (field === "purchase_product_seller") {
        const selectedSeller = vendorData?.vendor?.find(
          (vendor) => vendor.vendor_name === value
        );
        if (selectedSeller) {
          setFormData((prev) => ({
            ...prev,
            purchase_product_seller_add: selectedSeller.vendor_address,
            purchase_product_seller_gst: selectedSeller.vendor_gst_no,
            purchase_product_seller_contact:
              selectedSeller.vendor_contact_person,
          }));
        }
      }

      if (field === "purchase_product_broker") {
        const selectedBroker = vendorData?.vendor?.find(
          (vendor) => vendor.vendor_name === value
        );
        if (selectedBroker) {
          setFormData((prev) => ({
            ...prev,
            purchase_product_broker_add: selectedBroker.vendor_address,
          }));
        }
      }

      if (field === "purchase_product_no") {
        const selectedCompanySort = branchData?.branch?.find(
          (branch) => branch.branch_short === formData.branch_short
        );
        if (selectedCompanySort) {
          const productRef = `${selectedCompanySort.branch_name_short}/${selectedCompanySort.branch_state_short}/${value}/${formData.purchase_product_year}`;
          setFormData((prev) => ({
            ...prev,
            purchase_product_ref: productRef,
          }));
        }
      }
    },
    [
      branchData,
      formData.branch_short,
      formData.purchase_product_no,
      formData.purchase_product_year,
    ]
  );

  const handleRowDataChange = useCallback((rowIndex, field, value) => {
    const numericFields = [
      "purchase_productSub_rateInMt",
      "purchase_productSub_qntyInMt",
      "purchase_productSub_packing",
      "purchase_productSub_marking",
    ];

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
        purchase_productSub_name: "",
        purchase_productSub_name_hsn: "",
        purchase_productSub_description: "",
        purchase_productSub_rateInMt: "",
        purchase_productSub_qntyInMt: "",
        purchase_productSub_packing: "",
        purchase_productSub_marking: "",
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
    branch_short: "Company Sort",
    branch_name: "Company Name",
    branch_address: "Company Address",
    purchase_product_year: "Contract Year",
    purchase_product_date: "Contract Date",
    purchase_product_no: "Contract No",
    purchase_product_ref: "Contract Ref",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedPurchaseData = contractData.map((row) => ({
        ...row,
        purchase_productSub_rateInMt: parseFloat(row.purchase_productSub_rateInMt),
        purchase_productSub_qntyInMt: parseFloat(row.purchase_productSub_qntyInMt),
        purchase_productSub_packing: parseFloat(row.purchase_productSub_packing),
        purchase_productSub_marking: parseFloat(row.purchase_productSub_marking),
      }));

      const validatedData = contractFormSchema.parse({
        ...formData,
        purchase_product_data: processedPurchaseData,
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
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Company <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.branch_short}
                    onChange={(value) =>
                      handleSelectChange("branch_short", value)
                    }
                    options={
                      branchData?.branch?.map((branch) => ({
                        value: branch.branch_short,
                        label: branch.branch_short,
                      })) || []
                    }
                    placeholder="Select Company"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Seller <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.purchase_product_seller}
                    onChange={(value) =>
                      handleSelectChange("purchase_product_seller", value)
                    }
                    options={
                      vendorData?.vendor?.map((vendor) => ({
                        value: vendor.vendor_name,
                        label: vendor.vendor_name,
                      })) || []
                    }
                    placeholder="Select Seller"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Broker <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.purchase_product_broker}
                    onChange={(value) =>
                      handleSelectChange("purchase_product_broker", value)
                    }
                    options={
                      vendorData?.vendor?.map((vendor) => ({
                        value: vendor.vendor_name,
                        label: vendor.vendor_name,
                      })) || []
                    }
                    placeholder="Select Broker"
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Purchase Order No <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData?.purchase_product_no}
                    onChange={(value) =>
                      handleSelectChange("purchase_product_no", value)
                    }
                    options={
                      productNoData?.purchaseProductNo?.map((item) => ({
                        value: item,
                        label: item,
                      })) || []
                    }
                    placeholder="Select purchase order No"
                  />
                </div>
              </div>
            </div>

            <div className="mb-2   mt-[2px]">
              <div className="grid grid-cols-4 gap-6">
                <div
                  style={{ textAlign: "center" }}
                  className="bg-white rounded-md"
                >
                  <span style={{ fontSize: "12px" }}>
                    {formData.branch_name}
                  </span>
                  <br />
                  <span style={{ fontSize: "9px", display: "block" }}>
                    {formData.branch_address}
                  </span>
                </div>
                <div>
                  <Textarea
                    type="text"
                    placeholder="Enter seller Address"
                    value={formData.purchase_product_seller_add}
                    className=" text-[9px] bg-white border-none hover:border-none "
                    onChange={(e) =>
                      handleInputChange(
                        "purchase_product_seller_add",
                        e.target.value
                      )
                    }
                  />
                  <div className="flex flex-row justify-between">
                    <p className="text-[10px]">
                      seller gst:{formData.purchase_product_seller_gst}
                    </p>
                    <p className="text-[10px]">
                      seller contact:{formData.purchase_product_seller_contact}
                    </p>
                  </div>
                </div>
                <div>
                  <Textarea
                    type="text"
                    placeholder="Enter Broker Address"
                    className=" text-[9px] bg-white border-none hover:border-none"
                    value={formData.purchase_product_broker_add}
                    onChange={(e) =>
                      handleInputChange(
                        "purchase_product_broker_add",
                        e.target.value
                      )
                    }
                  />
                  <div className="flex flex-row justify-between">
                    <p className="text-[10px]">
                      year:{formData.purchase_product_year}
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    P.O. Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.purchase_product_date}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("purchase_product_date", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mb-2 ">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                     Ref. <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter purchase order Ref"
                    value={formData.purchase_product_ref}
                    disabled
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("purchase_product_ref", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Delivery Date
                  </label>
                  <Input
                    type="date"
                    className="bg-white"
                    value={formData.purchase_product_delivery_date}
                    onChange={(e) =>
                      handleInputChange(
                        "purchase_product_delivery_date",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className=" col-span-1 lg:col-span-2">
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      Delivery At
                    </label>
                    <Textarea
                      type="text"
                      className="bg-white"
                      placeholder="Enter Delivery At"
                      value={formData.purchase_product_delivery_at}
                      onChange={(e) =>
                        handleInputChange(
                          "purchase_product_delivery_at",
                          e.target.value
                        )
                      }
                    />
                  </div>
              </div>
         
              <div className="mb-2">
                <div className="grid grid-cols-4 gap-6">
                

                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      Payment Terms
                    </label>
                    <Textarea
                      type="text"
                      className="bg-white"
                      placeholder="Enter Payment Terms"
                      value={formData.purchase_product_payment_terms}
                      onChange={(e) =>
                        handleInputChange(
                          "purchase_product_payment_terms",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      Other Term & Cond.
                    </label>
                    <Textarea
                      type="text"
                      className="bg-white"
                      placeholder="Enter other term & condition"
                      value={formData.purchase_product_tc}
                      onChange={(e) =>
                        handleInputChange("purchase_product_tc", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                      GST Notification
                    </label>
                    <Textarea
                      type="text"
                      className="bg-white"
                      placeholder="Enter GST Notification"
                      value={formData.purchase_product_gst_notification}
                      onChange={(e) =>
                        handleInputChange(
                          "purchase_product_gst_notification",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                    >
                       Quality
                    </label>
                    <Textarea
                      type="text"
                      className="bg-white"
                      placeholder="Enter purchase order Quality"
                      value={formData.purchase_product_quality}
                      onChange={(e) =>
                        handleInputChange(
                          "purchase_product_quality",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-row items-center">
                  <h2 className="text-xl font-semibold">Purchase Order </h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Product /Description
                      </TableHead>



                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Rate / Quantity <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Packing / Marking{" "}
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
                            value={row.purchase_productSub_name}
                            onChange={(value) =>
                              handleRowDataChange(
                                rowIndex,
                                "purchase_productSub_name",
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
                           <Input
                              value={row.purchase_productSub_description}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "purchase_productSub_description",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Description"
                              type="text"
                            />
                            </div>
                        </TableCell>
                      

                      

                        <TableCell className="p-2 border ">
                        <div className="flex flex-col gap-2">
                          <Input
                            className="bg-white"
                            value={row.purchase_productSub_packing}
                            onChange={(e) =>
                              handleRowDataChange(
                                rowIndex,
                                "purchase_productSub_packing",
                                e.target.value
                              )
                            }
                            placeholder="Enter Packing"
                            type="text"
                          />
                          <Input
                            className="bg-white"
                            value={row.purchase_productSub_marking}
                            onChange={(e) =>
                              handleRowDataChange(
                                rowIndex,
                                "purchase_productSub_marking",
                                e.target.value
                              )
                            }
                            placeholder="Enter Marking"
                            type="text"
                          />
                          </div>
                        </TableCell>
                        <TableCell className="p-2 border w-40">
                          <div className="flex flex-col gap-2">
                            <Input
                              value={row.purchase_productSub_rateInMt}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "purchase_productSub_rateInMt",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Rate"
                              type="text"
                            />
                            <Input
                              value={row.purchase_productSub_qntyInMt}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "purchase_productSub_qntyInMt",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Quantity"
                              type="text"
                            />
                          </div>
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
          {createPurchaseMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={createPurchaseMutation.isPending}
          >
            {createPurchaseMutation.isPending
              ? "Creatting..."
              : "Create Purchase Order"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreatePurchaseOrder;
