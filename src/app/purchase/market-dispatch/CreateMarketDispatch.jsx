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
import { ButtonConfig } from "@/config/ButtonConfig";
import {
  useFetchCompanys,
  useFetchDispatchDcNo,
  useFetchGoDown,
  useFetchPurchaseProduct,
  useFetchVendor,
} from "@/hooks/useApi";
import Page from "@/app/dashboard/page";

// Validation Schemas
const productRowSchema = z.object({
  mpds_product_name: z.string().min(1, "Product name is required"),

  mpds_product_description: z.string().min(1, "Description is required"),
  mpds_bag: z.number().min(1, "Bag  is required"),
  mpds_qnty: z.number().min(1, "Quantity is required"),
  mpds_rate: z.number().min(1, "Rate is required"),
  mpds_amount: z.number().min(1, "Amount price is required"),
  mpd_godown: z.string().min(1, "Godown is required"),
});

const contractFormSchema = z.object({
  branch_short: z.string().min(1, "Company Sort is required"),
  branch_name: z.string().min(1, "Company Name is required"),
  branch_address: z.string().min(1, "Company Address is required"),
  mpd_date: z.string().min(1, "Date is required"),
  mpd_dc_no: z.string().min(1, "Dc No is required"),
  mpd_bill_ref: z.string().min(1, "Bill Ref is required"),
  mpd_vendor_name: z.string().min(1, "Vendor is required"),

  mpd_bill_value: z.string().optional(),
  mpd_remark: z.string().optional(),

  dispatch_data: z
    .array(productRowSchema)
    .min(1, "At least one product is required"),
});
const createDispatchOrder = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-create-market-dispatch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to create dispatch order");
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
const CreateMarketDispatch = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [contractData, setContractData] = useState([
    {
      mpd_godown: "",
      mpds_product_name: "",
      mpds_product_description: "",
      mpds_bag: "",
      mpds_qnty: "",
      mpds_rate: "",
      mpds_amount: "",
    },
  ]);

  const [formData, setFormData] = useState({
    branch_short: "",
    branch_name: "",
    branch_address: "",

    mpd_date: getTodayDate(),
    mpd_dc_no: "",
    mpd_bill_ref: "",
    mpd_vendor_name: "",
    mpd_bill_value: "",
    mpd_remark: "",
  });

  const { data: branchData } = useFetchCompanys();
  const { data: vendorData } = useFetchVendor();
  const { data: goDownData } = useFetchGoDown();
  const { data: purchaseProductData } = useFetchPurchaseProduct();
  const { data: disptachData } = useFetchDispatchDcNo();

  const createDispatchMutation = useMutation({
    mutationFn: createDispatchOrder,

    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/purchase/market-dispatch");
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
          setFormData((prev) => ({
            ...prev,
            branch_name: selectedCompanySort.branch_name,
            branch_address: selectedCompanySort.branch_address,
          }));
        }
      }
    },
    [branchData, formData.branch_short]
  );

  const handleRowDataChange = useCallback((rowIndex, field, value) => {
    const numericFields = ["mpds_bag", "mpds_qnty", "mpds_rate", "mpds_amount"];

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
        mpds_product_name: "",
        mpds_product_description: "",
        mpds_bag: "",
        mpds_qnty: "",
        mpds_rate: "",
        mpds_amount: "",
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
    mpd_date: " Date",
    mpd_dc_no: "Dc No",
    mpd_bill_ref: "Red",
    mpd_vendor_name: "Vendor",
    mpd_bill_value: "Bill",
    mpd_godown: "Go Down",
    mpd_remark: "Remark",
    mpds_product_name: "Product",
    mpds_product_description: "Description",
    mpds_bag: "Bag",
    mpds_qnty: "Quantity",
    mpds_rate: "Rate",
    mpds_amount: "Amount",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedPurchaseData = contractData.map((row) => ({
        ...row,
        mpds_bag: parseFloat(row.mpds_bag),
        mpds_qnty: parseFloat(row.mpds_qnty),
        mpds_rate: parseFloat(row.mpds_rate),
        mpds_amount: parseFloat(row.mpds_amount),
      }));

      const validatedData = contractFormSchema.parse({
        ...formData,
        dispatch_data: processedPurchaseData,
      });
      createDispatchMutation.mutate(validatedData);
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
                    Dc No <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData?.mpd_dc_no}
                    onChange={(value) => handleSelectChange("mpd_dc_no", value)}
                    options={
                      disptachData?.dispatchDcNo?.map((item) => ({
                        value: String(item),
                        label: String(item),
                      })) || []
                    }
                    placeholder="Select Dc No"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Ref. <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter dispatch order Ref"
                    value={formData.mpd_bill_ref}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("mpd_bill_ref", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.mpd_vendor_name}
                    onChange={(value) =>
                      handleSelectChange("mpd_vendor_name", value)
                    }
                    options={
                      vendorData?.vendor?.map((vendor) => ({
                        value: vendor.vendor_name,
                        label: vendor.vendor_name,
                      })) || []
                    }
                    placeholder="Select Vendor"
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
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Dispatch Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.mpd_date}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("mpd_date", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Bill Value
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter dispatch  bill Value"
                    value={formData.mpd_bill_value}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("mpd_bill_value", e.target.value)
                    }
                    onKeyPress={(e) => {
                      if (!/[0-9.]/.test(e.key) && e.key !== "Backspace") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                {/* <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Go Down
                  </label>
                  <MemoizedSelect
                    value={formData.mpd_godown}
                    onChange={(value) =>
                      handleSelectChange("mpd_godown", value)
                    }
                    options={
                      goDownData?.godown?.map((item) => ({
                        value: item.godown,
                        label: item.godown,
                      })) || []
                    }
                    placeholder="Select Go Down"
                  />
                </div> */}
              </div>
            </div>

            <div className="mb-2">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Remarks
                  </label>
                  <Textarea
                    type="text"
                    className="bg-white"
                    placeholder="Enter remarks"
                    value={formData.mpd_remark}
                    onChange={(e) =>
                      handleInputChange("mpd_remark", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-row items-center">
                  <h2 className="text-xl font-semibold">Dispatch Order </h2>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Godown<span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Product /Description
                        <span className="text-red-500">*</span>
                      </TableHead>

                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Bag / Quantity <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Rate / Amount <span className="text-red-500">*</span>
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
                              value={row.mpd_godown}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mpd_godown",
                                  value
                                )
                              }
                              options={
                                goDownData?.godown?.map((godown) => ({
                                  value: godown.godown,
                                  label: godown.godown,
                                })) || []
                              }
                              placeholder="Select Godown"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-2 border">
                          <div className="flex flex-col gap-2">
                            <MemoizedProductSelect
                              value={row.mpds_product_name}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mpds_product_name",
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
                              value={row.mpds_product_description}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mpds_product_description",
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
                              value={row.mpds_bag}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mpds_bag",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Bag"
                              type="text"
                            />
                            <Input
                              className="bg-white"
                              value={row.mpds_qnty}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mpds_qnty",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Quantity"
                              type="text"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="p-2 border w-40">
                          <div className="flex flex-col gap-2">
                            <Input
                              value={row.mpds_rate}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mpds_rate",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Rate"
                              type="text"
                            />
                            <Input
                              value={row.mpds_amount}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mpds_amount",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Amount"
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
          {createDispatchMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={createDispatchMutation.isPending}
          >
            {createDispatchMutation.isPending
              ? "Creatting..."
              : "Create Dispatch Order"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreateMarketDispatch;
