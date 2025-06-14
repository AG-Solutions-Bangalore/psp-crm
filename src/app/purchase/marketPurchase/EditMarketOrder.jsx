import Page from "@/app/dashboard/page";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchGoDownMarketPurchase,
  useFetchPurchaseProduct,
} from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronDown, MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { z } from "zod";

// Validation Schemas
const productRowSchema = z.object({
  mps_product_name: z.string().min(1, "Product Name is required"),
  mps_product_description: z.string().min(1, "Product Desc is required"),
  mps_bag: z.number().min(1, "Bag is required"),
  mps_qnty: z.number().min(1, "Quantity is required"),
  mps_rate: z.number().min(1, "Rate is required"),
  mps_amount: z.number().min(1, "Amount is required"),
  mp_godown: z.string().min(1, "Go Down is required"),
  id: z.any().optional(),
});

const contractFormSchema = z.object({
  mp_date: z.string().min(1, "Date is required"),
  mp_bill_ref: z.string().min(1, "Ref is required"),
  mp_vendor_name: z.string().min(1, "Vendor Name is required"),
  mp_bill_value: z.number().min(1, "Bill Value is required"),
  mp_remark: z.any().optional(),

  market_data: z
    .array(productRowSchema)
    .min(1, "At least one product is required"),
});

const updatePurchaseOrder = async ({ decryptedId, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-update-market-purchase/${decryptedId}`,
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
const EditMarketOrder = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const decryptedId = decryptId(id);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const [MarketData, setMarketData] = useState([
    {
      mp_godown: "",
      mps_product_name: "",
      mps_product_description: "",
      mps_bag: "",
      mps_qnty: "",
      mps_rate: "",
      mps_amount: "",
      id: "",
    },
  ]);

  const [formData, setFormData] = useState({
    mp_date: "",
    mp_bill_ref: "",
    mp_vendor_name: "",
    mp_bill_value: "",
    mp_remark: "",
  });

  const { data: godownPurchaseData } = useFetchGoDownMarketPurchase();
  const { data: purchaseProductData } = useFetchPurchaseProduct();

  const {
    data: MarketPurchaseData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["market", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-market-purchase-by-id/${decryptedId}`,
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
    if (MarketPurchaseData) {
      setFormData(MarketPurchaseData.marketPurchase);
      setMarketData(MarketPurchaseData.marketPurchaseSub);
    }
  }, [MarketPurchaseData]);

  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-delete-market-purchase-sub/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete contract Table");
      return response.json();
    },
    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        refetch();
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
  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(deleteItemId);
      MarketData((prevData) =>
        prevData.filter((row) => row.id !== deleteItemId)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
  };
  const updatePurchaseMutation = useMutation({
    mutationFn: updatePurchaseOrder,

    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg,
        });
        navigate("/purchase/market-purchase");
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
    const numericFields = ["mps_rate", "mps_amount"];

    if (numericFields.includes(field)) {
      const sanitizedValue = value.replace(/[^\d.]/g, "");
      const decimalCount = (sanitizedValue.match(/\./g) || []).length;

      if (decimalCount > 1) return;

      setMarketData((prev) => {
        const newData = [...prev];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [field]: sanitizedValue,
        };
        return newData;
      });
    } else {
      setMarketData((prev) => {
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
    setMarketData((prev) => [
      ...prev,
      {
        id: "",
        mps_product_name: "",
        mps_product_description: "",
        mps_bag: "",
        mps_qnty: "",
        mps_rate: "",
        mps_amount: "",
      },
    ]);
  }, []);

  const removeRow = useCallback(
    (index) => {
      if (MarketData.length > 1) {
        setMarketData((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [MarketData.length]
  );

  const fieldLabels = {
    mp_date: "Date is Required",
    mp_godown: "Godown is Required",
    mp_bill_ref: "Bill Ref is Required",
    mp_vendor_name: "Vendor Name is Required",
    mp_bill_value: "Bill No is Required",
    mps_product_name: "Production Name is Required",
    mps_bag: "Bag is Required",
    mps_qnty: "Quantity is Required",
    mps_product_description: "Production Desc is Required",
    mps_rate: "Rate is Required",
    mps_amount: "Amount is Required",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const processedMarketData = MarketData.map((row) => ({
        ...row,
        id: parseFloat(row.id),
        mps_bag: parseFloat(row.mps_bag),
        mps_qnty: parseFloat(row.mps_qnty),
        mps_rate: parseFloat(row.mps_rate),
        mps_amount: parseFloat(row.mps_amount),
      }));

      const validatedData = contractFormSchema.parse({
        ...formData,
        mp_bill_value: parseFloat(formData.mp_bill_value),

        market_data: processedMarketData,
      });

      console.log("Before processing:", validatedData);

      updatePurchaseMutation.mutate({ decryptedId, data: validatedData });
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

        return;
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
    return <LoaderComponent name=" Market Purchase Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Market Purchase  Data"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    M.P.R Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.mp_date}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("mp_date", e.target.value)
                    }
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
                    placeholder="Enter Bill Ref"
                    value={formData.mp_bill_ref}
                    disabled
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("mp_bill_ref", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Vendor Name<span className="text-red-500">*</span>
                  </label>
                  <MemoizedSelect
                    value={formData.mp_vendor_name}
                    onChange={(value) =>
                      handleSelectChange("mp_vendor_name", value)
                    }
                    options={
                      godownPurchaseData?.godown?.map((godown) => ({
                        value: godown.godown,
                        label: godown.godown,
                      })) || []
                    }
                    placeholder="Select  Vendor Name"
                  />
                </div>
                <div>
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Bill Value <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.mp_bill_value}
                    className="bg-white"
                    onChange={(e) =>
                      handleInputChange("mp_bill_value", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="mb-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex flex-row items-center">
                  <h2 className="text-xl font-semibold">Market Purchase</h2>
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
                    {MarketData.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-gray-50">
                        <TableCell className="p-2 border">
                          <div className="flex flex-col gap-2">
                            <MemoizedProductSelect
                              value={row.mp_godown}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mp_godown",
                                  value
                                )
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
                        </TableCell>
                        <TableCell className="p-2 border">
                          <div className="flex flex-col gap-2">
                            <MemoizedProductSelect
                              value={row.mps_product_name}
                              onChange={(value) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mps_product_name",
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
                              value={row.mps_product_description}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mps_product_description",
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
                              value={row.mps_bag}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mps_bag",
                                  e.target.value
                                )
                              }
                              placeholder="Enter Bag"
                              type="text"
                            />
                            <Input
                              className="bg-white"
                              value={row.mps_qnty}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mps_qnty",
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
                              value={row.mps_rate}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mps_rate",
                                  e.target.value
                                )
                              }
                              className="bg-white"
                              placeholder="Enter Rate"
                              type="text"
                            />
                            <Input
                              value={row.mps_amount}
                              onChange={(e) =>
                                handleRowDataChange(
                                  rowIndex,
                                  "mps_amount",
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
                          {/* <Button
                            variant="ghost"
                            onClick={() => removeRow(rowIndex)}
                            disabled={MarketData.length === 1}
                            className="text-red-500 "
                            type="button"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button> */}
                          {row.id ? (
                            <Button
                              variant="ghost"
                              onClick={() => handleDeleteRow(row.id)}
                              className="text-red-500"
                              type="button"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              onClick={() => removeRow(rowIndex)}
                              disabled={MarketData.length === 1}
                              className="text-red-500 "
                              type="button"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </Button>
                          )}
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
          {updatePurchaseMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={updatePurchaseMutation.isPending}
          >
            {updatePurchaseMutation.isPending
              ? "Updatting..."
              : "Update Market Order"}
          </Button>
        </div>
      </form>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              market purchase from this purchase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={`${ButtonConfig.backgroundColor}  ${ButtonConfig.textColor} text-black hover:bg-red-600`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Page>
  );
};

export default EditMarketOrder;
