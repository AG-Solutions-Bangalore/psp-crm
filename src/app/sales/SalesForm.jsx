import { SALES_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/page/page";
import DeleteAlertDialog from "@/components/common/DeleteAlertDialog";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";
import { MemoizedSelect } from "@/components/common/MemoizedSelect";
import PageHeaders from "@/components/common/PageHeaders";
import { LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import {
  useFetchColor,
  useFetchCustomer,
  useFetchProduct,
  useFetchVendor,
} from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
const fetchRawMaterialById = async (id, token) => {
  const response = await apiClient.get(`${SALES_LIST}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const SalesForm = () => {
  const { id } = useParams();
  let decryptedId = null;
  const isEdit = Boolean(id);
  const [progress, setProgress] = useState(0);

  if (isEdit) {
    try {
      const rawId = decodeURIComponent(id);
      decryptedId = decryptId(rawId);
    } catch (err) {
      console.error("Failed to decrypt ID:", err.message);
    }
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);

  const editId = Boolean(id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const today = moment().format("YYYY-MM-DD");
  const [isLoading, setIsLoading] = useState(false);

  const token = usetoken();

  const [formData, setFormData] = useState({
    sales_type: "",
    sales_date: today,
    sales_vendor_id: "",
    sales_dispatched: "",
    sales_document: "",
    sales_description: "",
    sales_quantity: "",
    sales_rate: "",
    sales_amount: "",
  });

  const [invoiceData, setInvoiceData] = useState([
    {
      id: editId ? "" : null,
      sales_sub_color_id: "",
      sales_sub_thickness: "",
      sales_sub_weight: "",
      sales_sub_mtr: "",
    },
  ]);
  const { data: rawMaterialById, isFetching } = useQuery({
    queryKey: ["rawMaterialById", decryptedId],
    queryFn: () => fetchRawMaterialById(decryptedId, token),
    enabled: !!decryptedId,
  });
  useEffect(() => {
    if (decryptedId && rawMaterialById?.data) {
      const raw = rawMaterialById.data;
      setFormData({
        sales_type: raw.sales_type || "",
        sales_date: raw.sales_date || "",
        sales_vendor_id: raw.sales_vendor_id || "",
        sales_dispatched: raw.sales_dispatched || "",
        sales_document: raw.sales_document || "",
        sales_description: raw.sales_description || "",
        sales_quantity: raw.sales_quantity || "",
        sales_rate: raw.sales_rate || "",
        sales_amount: raw.sales_amount || "",
      });

      const subItems = Array.isArray(rawMaterialById?.data?.subs)
        ? rawMaterialById?.data?.subs.map((sub) => ({
            id: sub.id || "",

            sales_sub_color_id: sub.sales_sub_color_id || "",
            sales_sub_thickness: sub.sales_sub_thickness || "",
            sales_sub_weight: sub.sales_sub_weight || "",
            sales_sub_mtr: sub.sales_sub_mtr || "",
          }))
        : [
            {
              sales_sub_color_id: "",
              sales_sub_thickness: "",
              sales_sub_weight: "",
              sales_sub_mtr: "",
            },
          ];

      setInvoiceData(subItems);
    }
  }, [decryptedId, rawMaterialById]);

  const { data: productData, isLoading: loadingproduct } = useFetchProduct();
  const { data: customerData, isLoading: loadingvendor } = useFetchCustomer();
  const { data: colorData, isLoading: loadingcolor } = useFetchColor();
  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        sales_sub_color_id: "",
        sales_sub_thickness: "",
        sales_sub_weight: "",
        sales_sub_mtr: "",
      },
    ]);
  }, []);
  const removeRow = useCallback(
    (index) => {
      if (invoiceData.length > 1) {
        setInvoiceData((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [invoiceData.length]
  );

  const handlePaymentChange = (selectedValue, rowIndex, fieldName) => {
    const value =
      selectedValue?.target?.value !== undefined
        ? selectedValue.target.value
        : selectedValue;

    if (
      (fieldName === "sales_sub_thickness" ||
        fieldName === "sales_sub_weight" ||
        fieldName === "sales_sub_mtr") &&
      !/^\d*\.?\d*$/.test(value)
    ) {
      console.warn(
        "Invalid input: Only digits and an optional decimal point are allowed for weight or bags."
      );
      return;
    }

    setInvoiceData((prevData) => {
      const updatedData = [...prevData];
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [fieldName]: value,
      };
      return updatedData;
    });
  };

  const handleInputChange = (e, field) => {
    const value = e.target ? e.target.value : e;
    const updatedFormData = { ...formData, [field]: value };

    if (field === "sales_type") {
      const selectedProduct = productData?.data?.find(
        (item) => item.product_type === value
      );

      if (selectedProduct) {
        updatedFormData.sales_description = selectedProduct.product_default;
      }
    }
    if (field === "sales_quantity" || field === "sales_rate") {
      const quantity =
        field === "sales_quantity" ? value : formData.sales_quantity;
      const rate = field === "sales_rate" ? value : formData.sales_rate;

      const salesAmount = Number(quantity) * Number(rate);

      if (!isNaN(salesAmount)) {
        updatedFormData.sales_amount = salesAmount;
      }
    }

    setFormData(updatedFormData);
  };

  useEffect(() => {
    const calculateProgress = () => {
      const totalFormFields = Object.keys(formData).length;
      const filledFormFields = Object.values(formData).filter(
        (value) => value.toString().trim() !== ""
      ).length;

      const totalInvoiceFields = invoiceData.length * 4;
      const filledInvoiceFields = invoiceData.reduce((acc, item) => {
        return (
          acc +
          (item.sales_sub_color_id.toString().trim() !== "" ? 1 : 0) +
          (item.sales_sub_thickness.toString().trim() !== "" ? 1 : 0) +
          (item.sales_sub_weight.toString().trim() !== "" ? 1 : 0) +
          (item.sales_sub_mtr.toString().trim() !== "" ? 1 : 0)
        );
      }, 0);

      const totalFields = totalFormFields + totalInvoiceFields;
      const filledFields = filledFormFields + filledInvoiceFields;

      const percentage =
        totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 100);
      setProgress(percentage);
    };

    calculateProgress();
  }, [formData, invoiceData]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.sales_type) missingFields.push("Sales Type");
    if (!formData.sales_date) missingFields.push("Date");
    if (!formData.sales_vendor_id) missingFields.push("Vendor");
    if (!formData.sales_quantity) missingFields.push("Quantity");
    if (!formData.sales_rate) missingFields.push("Rate");
    if (!formData.sales_amount) missingFields.push("Ampunt");

    invoiceData.forEach((row, index) => {
      if (!row.sales_sub_color_id)
        missingFields.push(`Row ${index + 1}: Color`);
      if (!row.sales_sub_thickness)
        missingFields.push(`Row ${index + 1}: Thickness`);
      if (!row.sales_sub_weight) missingFields.push(`Row ${index + 1}: Weight`);
    });

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div>
            <p>Please fill in the following fields:</p>
            <ul className="list-disc pl-5">
              {missingFields.map((field, i) => (
                <li key={i}>{field}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        subs: invoiceData,
      };

      const url = editId ? `${SALES_LIST}/${decryptedId}` : SALES_LIST;
      const method = editId ? "put" : "post";

      const response = await apiClient[method](url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response?.data.code == 201) {
        toast({
          title: "Success",
          description: response.data.message,
        });
        navigate("/sales");
      } else {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to save sales",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteRow = (productId) => {
    setDeleteConfirmOpen(true);
    setDeleteItemId(productId);
  };
  const handleDelete = async () => {
    try {
      const response = await apiClient.delete(
        `${SALES_LIST}/sub/${deleteItemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (data.code == 201) {
        toast({
          title: "Success",
          description: data.message,
        });

        setInvoiceData((prevData) =>
          prevData.filter((row) => row.id !== deleteItemId)
        );
      } else if (data.code == 400) {
        toast({
          title: "Duplicate Entry",
          description: data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Unexpected Response",
          description: data.message || "Something unexpected happened.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteItemId(null);
    }
  };

  if (isFetching || loadingvendor || loadingcolor || loadingproduct) {
    return <LoaderComponent name="Sales" />;
  }
  return (
    <Page>
      <div className="p-0">
        <div className="">
          <form onSubmit={handleSubmit} className="w-full ">
            <PageHeaders
              title={editId ? "Update Sales" : "Create Sales"}
              subtitle="sales"
              progress={progress}
              mode={editId ? "edit" : "create"}
            />
            <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4  gap-2">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className={`text-sm font-medium ${ButtonConfig.cardLabel}`}
                      >
                        Sales Type <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <MemoizedSelect
                      value={formData.sales_type}
                      onChange={(e) => handleInputChange(e, "sales_type")}
                      options={
                        productData?.data?.map((product) => ({
                          value: product.product_type,
                          label: product.product_type,
                        })) || []
                      }
                      placeholder="Select Sales Type"
                    />
                  </div>

                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="bg-white"
                      value={formData.sales_date}
                      onChange={(e) => handleInputChange(e, "sales_date")}
                      type="date"
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        className={`text-sm font-medium ${ButtonConfig.cardLabel}`}
                      >
                        Vendor <span className="text-red-500">*</span>
                      </label>
                    </div>

                    <MemoizedSelect
                      value={formData.sales_vendor_id}
                      onChange={(e) => handleInputChange(e, "sales_vendor_id")}
                      options={
                        customerData?.data?.map((vendor) => ({
                          value: vendor.id,
                          label: vendor.vendor_name,
                        })) || []
                      }
                      placeholder="Select Vendor"
                    />
                  </div>

                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Dispatched
                    </label>
                    <Input
                      className="bg-white"
                      value={formData.sales_dispatched}
                      onChange={(e) => handleInputChange(e, "sales_dispatched")}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Document
                    </label>
                    <Input
                      className="bg-white"
                      value={formData.sales_document}
                      onChange={(e) => handleInputChange(e, "sales_document")}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="bg-white"
                      value={formData.sales_quantity}
                      onChange={(e) => handleInputChange(e, "sales_quantity")}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Rate <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="bg-white"
                      value={formData.sales_rate}
                      onChange={(e) => handleInputChange(e, "sales_rate")}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="bg-white"
                      value={formData.sales_amount}
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label
                    className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                  >
                    Description
                  </label>
                  <Textarea
                    className="bg-white"
                    value={formData.sales_description}
                    onChange={(e) => handleInputChange(e, "sales_description")}
                    maxLength={500}
                  />
                </div>
                <div className="mt-4 grid grid-cols-1">
                  <Table className="border border-gray-300 rounded-lg shadow-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 w-[20%]">
                          <div className="flex items-center justify-between">
                            <span>
                              Color
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 w-[20%]">
                          <div className="flex items-center justify-between">
                            <span>
                              Thickness
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 w-[20%]">
                          <div className="flex items-center justify-between">
                            <span>
                              Weight
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 w-[20%]">
                          Meter
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 text-center w-[10%]">
                          <div className="flex justify-center items-center gap-2">
                            Action
                            <PlusCircle
                              onClick={addRow}
                              className="cursor-pointer text-blue-500 hover:text-gray-800 h-4 w-4"
                            />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {invoiceData.map((row, rowIndex) => (
                        <TableRow
                          key={rowIndex}
                          className="border-t border-gray-200 hover:bg-gray-50"
                        >
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <MemoizedProductSelect
                                value={row.sales_sub_color_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "sales_sub_color_id"
                                  )
                                }
                                options={
                                  colorData?.data?.map((item) => ({
                                    value: item.id,
                                    label: item.color,
                                  })) || []
                                }
                                placeholder="Select Color"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <Input
                                className="bg-white border border-gray-300 rounded-lg  focus:ring-2 "
                                value={
                                  invoiceData[rowIndex]?.sales_sub_thickness ||
                                  ""
                                }
                                placeholder="Enter Thickness"
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "sales_sub_thickness"
                                  )
                                }
                                maxLength={10}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <Input
                                className="bg-white border border-gray-300 rounded-lg  focus:ring-2 "
                                value={
                                  invoiceData[rowIndex]?.sales_sub_weight || ""
                                }
                                placeholder="Enter Weight"
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "sales_sub_weight"
                                  )
                                }
                                maxLength={10}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <Input
                                className="bg-white border border-gray-300 rounded-lg  focus:ring-2 "
                                value={
                                  invoiceData[rowIndex]?.sales_sub_mtr || ""
                                }
                                placeholder="Enter Meter"
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "sales_sub_mtr"
                                  )
                                }
                                maxLength={10}
                              />
                            </div>
                          </TableCell>

                          <TableCell className="p-2 align-middle">
                            {row.id ? (
                              <Button
                                variant="ghost"
                                onClick={() => handleDeleteRow(row.id)}
                                className="text-red-500"
                                disabled={invoiceData.length === 1}
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                onClick={() => removeRow(rowIndex)}
                                disabled={invoiceData.length === 1}
                                className="text-red-500"
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
              </CardContent>
            </Card>
            <div className="flex flex-row items-center gap-2 justify-end ">
              <Button
                type="submit"
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editId ? "Updating..." : "Creating..."}
                  </>
                ) : editId ? (
                  "Update Sales"
                ) : (
                  "Create Sales"
                )}{" "}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  navigate("/sales");
                }}
                className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
              >
                Go Back
              </Button>
            </div>
          </form>
        </div>
      </div>

      <DeleteAlertDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        description="Sales Sub"
        handleDelete={handleDelete}
      />
    </Page>
  );
};

export default SalesForm;
