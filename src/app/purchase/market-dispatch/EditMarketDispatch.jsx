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
  useFetchCompanys,
  useFetchDispatchDcNo,
  useFetchGoDown,
  useFetchPurchaseProduct,
  useFetchVendor,
} from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { useMutation, useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  MinusCircle,
  Package,
  PlusCircle,
  TestTubes,
  Trash2,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { z } from "zod";

// Validation Schemas
const updateDispatchOrder = async ({ decryptedId, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-update-market-dispatch/${decryptedId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) throw new Error("Failed to update dispatch");
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

const EditMarketDispatch = () => {
  const { id } = useParams();
  const decryptedId = decryptId(id);

  const { toast } = useToast();
  const navigate = useNavigate();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [formData, setFormData] = useState({
    branch_short: "",
    branch_name: "",
    branch_address: "",

    mpd_date: "",
    mpd_dc_no: "",
    mpd_bill_ref: "",
    mpd_vendor_name: "",
    mpd_bill_value: "",
    mpd_remark: "",
  });
  const [contractData, setContractData] = useState([]);

  const {
    data: dispatchDatas,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["marketDispatch", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-market-dispatch-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch dispatch order");
      return response.json();
    },
  });
  useEffect(() => {
    if (dispatchDatas) {
      setFormData({
        branch_short: dispatchDatas.marketDispatch.branch_short,
        branch_name: dispatchDatas.marketDispatch.branch_name,
        branch_address: dispatchDatas.marketDispatch.branch_address,
        mpd_date: dispatchDatas.marketDispatch.mpd_date,

        mpd_dc_no: dispatchDatas.marketDispatch.mpd_dc_no,
        mpd_bill_ref: dispatchDatas.marketDispatch.mpd_bill_ref,
        mpd_vendor_name: dispatchDatas.marketDispatch.mpd_vendor_name,

        mpd_bill_value: dispatchDatas.marketDispatch.mpd_bill_value,
        mpd_godown: dispatchDatas.marketDispatch.mpd_godown,
        mpd_remark: dispatchDatas.marketDispatch.mpd_remark,
        purchase_product_seller_contact:
          dispatchDatas.marketDispatch.purchase_product_seller_contact,

        dispatch_data: dispatchDatas.marketDispatchSub,
      });
      setContractData(dispatchDatas.marketDispatchSub);
    }
  }, [dispatchDatas]);

  const { data: branchData } = useFetchCompanys();
  const { data: vendorData } = useFetchVendor();
  const { data: goDownData } = useFetchGoDown();
  const { data: purchaseProductData } = useFetchPurchaseProduct();
  const { data: disptachData } = useFetchDispatchDcNo();

  const updateDispatchMutation = useMutation({
    mutationFn: updateDispatchOrder,
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

  const handleSelectChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

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
        mpd_godown: "",
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
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-delete-market-dispatch-sub/${productId}`,
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
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dispatch Table deleted successfully",
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

  const handleDeleteRow = (productId) => {
    setDeleteItemId(productId);
    setDeleteConfirmOpen(true);
  };
  const confirmDelete = async () => {
    try {
      await deleteProductMutation.mutateAsync(deleteItemId);
      setContractData((prevData) =>
        prevData.filter((row) => row.id !== deleteItemId)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
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

      const updateData = {
        ...formData,
        dispatch_data: processedPurchaseData,
      };
      updateDispatchMutation.mutate({ decryptedId, data: updateData });
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
  const CompactViewSection = ({ dispatchDatas }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const InfoItem = ({ icon: Icon, label, value }) => (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-yellow-600 shrink-0" />
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="text-sm font-medium">{value || "N/A"}</span>
      </div>
    );

    const toggleView = () => {
      const content = contentRef.current;

      if (isExpanded) {
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          transformOrigin: "top",
          transformStyle: "preserve-3d",
          rotateX: -90,
          onComplete: () => setIsExpanded(false),
        });
      } else {
        setIsExpanded(true);
        gsap.fromTo(
          content,
          {
            height: 0,
            opacity: 0,
            rotateX: -90,
          },
          {
            height: "auto",
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut",
            transformOrigin: "top",
            transformStyle: "preserve-3d",
            rotateX: 0,
          }
        );
      }
    };

    const TreatmentInfo = () =>
      dispatchDatas?.marketDispatch?.branch_short && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <InfoItem
              icon={TestTubes}
              label="PO. Ref"
              value={dispatchDatas.marketDispatch.mpd_bill_ref}
            />
            <div className=" col-span-2">
              <InfoItem
                icon={TestTubes}
                label="Branch Add"
                value={dispatchDatas.marketDispatch.branch_address}
              />
            </div>
          </div>
        </div>
      );

    if (isLoading) {
      return <LoaderComponent name="Dispatch  Data" />; // ✅ Correct prop usage
    }

    // Render error state
    if (isError) {
      return <ErrorComponent message="Error Dispatch Data" refetch={refetch} />;
    }

    return (
      <Card className="mb-2 " ref={containerRef}>
        <div
          className={`p-4 ${ButtonConfig.cardColor} flex items-center justify-between`}
        >
          <h2 className="text-lg font-semibold  flex items-center gap-2">
            <p className="flex gap-1 relative items-center">
              {" "}
              <FileText className="h-5 w-5" />
              {dispatchDatas?.marketDispatch?.branch_short} -
              <span className="text-sm uppercase">
                {dispatchDatas?.marketDispatch?.branch_name}
              </span>
            </p>
          </h2>

          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUp
                onClick={toggleView}
                className="h-5 w-5 cursor-pointer  text-yellow-600"
              />
            ) : (
              <ChevronDown
                onClick={toggleView}
                className="h-5 w-5 cursor-pointer  text-yellow-600"
              />
            )}
          </div>
        </div>
        <div
          ref={contentRef}
          className="transform-gpu"
          style={{ transformStyle: "preserve-3d" }}
        >
          <CardContent className="p-4">
            <div className="space-y-2 flex items-center justify-between">
              <InfoItem
                icon={Package}
                label="Remark"
                value={dispatchDatas?.marketDispatch?.mpd_remark}
              />

              <InfoItem
                icon={TestTubes}
                label="DC No "
                value={dispatchDatas?.marketDispatch?.mpd_dc_no}
              />
            </div>

            <TreatmentInfo />
          </CardContent>
        </div>
      </Card>
    );
  };
  return (
    <Page>
      <form
        onSubmit={handleSubmit}
        className="w-full p-4 bg-blue-50/30 rounded-lg"
      >
        <CompactViewSection dispatchDatas={dispatchDatas} />
        <Card className={`mb-6 ${ButtonConfig.cardColor} `}>
          <CardContent className="p-6">
            {/* Basic Details Section */}
            <div className="mb-0">
              <div className="grid grid-cols-4 gap-6">
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
                        Product /Description
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
                                goDownData?.godown?.map((item) => ({
                                  value: item.godown,
                                  label: item.godown,
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
                              disabled={contractData.length === 1}
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
          {updateDispatchMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={updateDispatchMutation.isPending}
          >
            {updateDispatchMutation.isPending
              ? "Updating..."
              : "Update Dispatch Order"}
          </Button>
        </div>
      </form>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              dispatch from this enquiry.
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

export default EditMarketDispatch;
