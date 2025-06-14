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
import { Textarea } from "@/components/ui/textarea";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchCompanys,
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
import Page from "../dashboard/page";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

// Validation Schemas
const updatePurchaseOrder = async ({ decryptedId, data }) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-update-purchase-product/${decryptedId}`,
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
const EditPurchaseOrder = () => {
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
    purchase_product_year: "",
    purchase_product_date: "",
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
    contract_destination_port: "",
    purchase_product_tc: "",
    purchase_product_gst_notification: "",
    purchase_product_quality: "",
    purchase_product_status: "Pending",
  });
  const [contractData, setContractData] = useState([]);

  const {
    data: purchaseProductDatas,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["purchaseProduct", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-purchase-product-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch Purchase order");
      return response.json();
    },
  });
  useEffect(() => {
    if (purchaseProductDatas) {
      setFormData({
        branch_short: purchaseProductDatas.purchaseProduct.branch_short,
        branch_name: purchaseProductDatas.purchaseProduct.branch_name,
        branch_address: purchaseProductDatas.purchaseProduct.branch_address,
        purchase_product_year:
          purchaseProductDatas.purchaseProduct.purchase_product_year,

        purchase_product_date:
          purchaseProductDatas.purchaseProduct.purchase_product_date,
        purchase_product_no:
          purchaseProductDatas.purchaseProduct.purchase_product_no,
        purchase_product_ref:
          purchaseProductDatas.purchaseProduct.purchase_product_ref,

        purchase_product_seller:
          purchaseProductDatas.purchaseProduct.purchase_product_seller,
        purchase_product_seller_add:
          purchaseProductDatas.purchaseProduct.purchase_product_seller_add,
        purchase_product_seller_gst:
          purchaseProductDatas.purchaseProduct.purchase_product_seller_gst,
        purchase_product_seller_contact:
          purchaseProductDatas.purchaseProduct.purchase_product_seller_contact,

        purchase_product_broker:
          purchaseProductDatas.purchaseProduct.purchase_product_broker,
        purchase_product_broker_add:
          purchaseProductDatas.purchaseProduct.purchase_product_broker_add,

        purchase_product_delivery_date:
          purchaseProductDatas.purchaseProduct.purchase_product_delivery_date,
        purchase_product_delivery_at:
          purchaseProductDatas.purchaseProduct.purchase_product_delivery_at,
        purchase_product_payment_terms:
          purchaseProductDatas.purchaseProduct.purchase_product_payment_terms,

        purchase_product_tc:
          purchaseProductDatas.purchaseProduct.purchase_product_tc,
        purchase_product_gst_notification:
          purchaseProductDatas.purchaseProduct
            .purchase_product_gst_notification,
        purchase_product_quality:
          purchaseProductDatas.purchaseProduct.purchase_product_quality,

        purchase_product_status:
          purchaseProductDatas.purchaseProduct.purchase_product_status,
        purchase_product_data: purchaseProductDatas.purchaseProductSub,
      });
      setContractData(purchaseProductDatas.purchaseProductSub);
    }
  }, [purchaseProductDatas]);

  const { data: branchData } = useFetchCompanys();
  const { data: vendorData } = useFetchVendor();
  const { data: purchaseProductData } = useFetchPurchaseProduct();

  const updatePOMutation = useMutation({
    mutationFn: updatePurchaseOrder,
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
    },
    [formData.purchase_product_year]
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
    purchase_productSub_packing: "hfhvhjv",
  };
  const deleteProductMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-delete-purchase-product-sub/${productId}`,
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
        description: "Purchase Table deleted successfully",
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
    const missingFields = [];
    if (!formData.purchase_product_seller) missingFields.push("Seller");
    if (!formData.purchase_product_broker) missingFields.push("Broker");
    if (!formData.purchase_product_date) missingFields.push("P.O Date");
    contractData.forEach((row, index) => {
      if (!row.purchase_productSub_name)
        missingFields.push(`Row ${index + 1}: Product Name`);
      if (!row.purchase_productSub_packing)
        missingFields.push(`Row ${index + 1}: Packing`);
      if (!row.purchase_productSub_marking)
        missingFields.push(`Row ${index + 1}: Marking`);
      if (!row.purchase_productSub_rateInMt)
        missingFields.push(`Row ${index + 1}: Rate in MT`);
      if (!row.purchase_productSub_qntyInMt)
        missingFields.push(`Row ${index + 1}: Quantity in MT`);
    });

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div>
            <p>Please fill in the following fields:</p>
            <ul className="list-disc pl-5">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }
    try {
      const processedPurchaseData = contractData.map((row) => ({
        ...row,
        purchase_productSub_rateInMt: parseFloat(
          row.purchase_productSub_rateInMt
        ),
        purchase_productSub_qntyInMt: parseFloat(
          row.purchase_productSub_qntyInMt
        ),
        purchase_productSub_packing: parseFloat(
          row.purchase_productSub_packing
        ),
        purchase_productSub_marking: parseFloat(
          row.purchase_productSub_marking
        ),
      }));

      const updateData = {
        ...formData,
        purchase_product_data: processedPurchaseData,
      };
      updatePOMutation.mutate({ decryptedId, data: updateData });
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
  const CompactViewSection = ({ purchaseProductDatas }) => {
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
        // Folding animation
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
        // Unfolding animation
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
      purchaseProductDatas?.purchaseProduct?.branch_short && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <InfoItem
              icon={TestTubes}
              label="PO. Ref"
              value={purchaseProductDatas.purchaseProduct.purchase_product_ref}
            />
            <div className=" col-span-2">
              <InfoItem
                icon={TestTubes}
                label="Branch Add"
                value={purchaseProductDatas.purchaseProduct.branch_address}
              />
            </div>
          </div>
        </div>
      );

    return (
      <Card className="mb-2 " ref={containerRef}>
        <div
          className={`p-4 ${ButtonConfig.cardColor} flex items-center justify-between`}
        >
          <h2 className="text-lg font-semibold  flex items-center gap-2">
            <p className="flex gap-1 relative items-center">
              {" "}
              <FileText className="h-5 w-5" />
              {purchaseProductDatas?.purchaseProduct?.branch_short} -
              <span className="text-sm uppercase">
                {purchaseProductDatas?.purchaseProduct?.branch_name}
              </span>
            </p>
          </h2>

          <div className="flex items-center gap-2">
            <span className=" flex items-center gap-2    text-xs font-medium  text-yellow-800 ">
              <MemoizedSelect
                value={formData.purchase_product_status}
                onChange={(value) =>
                  handleSelectChange("purchase_product_status", value)
                }
                options={[
                  { value: "Pending", label: "Pending" },
                  { value: "Cancel", label: "Cancel" },
                  { value: "Close", label: "Close" },
                ]}
                placeholder="Select Status"
              />
            </span>

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
            {/* Basic Info */}

            <div className="space-y-2 flex items-center justify-between">
              <InfoItem
                icon={Package}
                label="PO.Year"
                value={
                  purchaseProductDatas?.purchaseProduct?.purchase_product_year
                }
              />

              <InfoItem
                icon={TestTubes}
                label="PO. No "
                value={
                  purchaseProductDatas?.purchaseProduct?.purchase_product_no
                }
              />
            </div>

            <TreatmentInfo />
          </CardContent>
        </div>
      </Card>
    );
  };

  if (isLoading) {
    return <LoaderComponent name="Purchase Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Purchase  Data"
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
        <CompactViewSection purchaseProductDatas={purchaseProductDatas} />
        <Card className={`mb-6 ${ButtonConfig.cardColor} `}>
          <CardContent className="p-6">
            {/* Basic Details Section */}
            <div className="mb-0">
              <div className="grid grid-cols-4 gap-2">
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
                <div className=" row-span-2  ">
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-xs mb-[2px] font-medium `}
                  >
                    Delivery At
                  </label>
                  <Textarea
                    type="text"
                    rows={4}
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
                        Packing / Marking{" "}
                        <span className="text-red-500">*</span>
                      </TableHead>
                      <TableHead className="p-2 text-center border text-sm font-medium">
                        Rate / Quantity <span className="text-red-500">*</span>
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
          {updatePOMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={updatePOMutation.isPending}
          >
            {updatePOMutation.isPending
              ? "Updating..."
              : "Update Purchase Order"}
          </Button>
        </div>
      </form>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              purchase order from this enquiry.
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

export default EditPurchaseOrder;
