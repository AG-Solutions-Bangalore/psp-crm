import { FABRIC_SALE_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/dashboard/page";
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchColor, useFetchVendor } from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
const fetchRawMaterialById = async (id, token) => {
  const response = await apiClient.get(`${FABRIC_SALE_LIST}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const FabricSaleForm = () => {
  const { id } = useParams();
  let decryptedId = null;
  const isEdit = Boolean(id);

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
  const [progress, setProgress] = useState(0);

  const token = usetoken();

  const [formData, setFormData] = useState({
    fabric_sales_date: today,
    fabric_sales_vendor_id: "",
  });

  const [invoiceData, setInvoiceData] = useState([
    {
      id: editId ? "" : null,
      fabric_sales_sub_color_id: "",
      fabric_sales_thickness: "",
      fabric_sales_weight: "",
      fabric_sales_mtr: "",
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
        fabric_sales_date: raw.fabric_sales_date || "",
        fabric_sales_vendor_id: raw.fabric_sales_vendor_id || "",
      });

      const subItems = Array.isArray(rawMaterialById?.data?.subs)
        ? rawMaterialById?.data?.subs.map((sub) => ({
            id: sub.id || "",
            fabric_sales_sub_color_id: sub.fabric_sales_sub_color_id || "",
            fabric_sales_thickness: sub.fabric_sales_thickness || "",
            fabric_sales_weight: sub.fabric_sales_weight || "",
            fabric_sales_mtr: sub.fabric_sales_mtr || "",
          }))
        : [
            {
              fabric_sales_sub_color_id: "",
              fabric_sales_thickness: "",
              fabric_sales_weight: "",
              fabric_sales_mtr: "",
            },
          ];

      setInvoiceData(subItems);
    }
  }, [decryptedId, rawMaterialById]);

  const { data: vendorData, isLoading: loadingvendor } = useFetchVendor();
  const { data: colorData, isLoading: loadingitem } = useFetchColor();

  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        fabric_sales_sub_color_id: "",
        fabric_sales_thickness: "",
        fabric_sales_weight: "",
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
      (fieldName === "fabric_sales_weight" ||
        fieldName === "fabric_sales_thickness" ||
        fieldName === "fabric_sales_mtr") &&
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
    let updatedFormData = { ...formData, [field]: value };

    setFormData(updatedFormData);
  };

  useEffect(() => {
    const calculateProgress = () => {
      const totalFormFields = Object.keys(formData).length;
      const filledFormFields = Object.values(formData).filter(
        (value) => value.toString().trim() !== ""
      ).length;

      const totalInvoiceFields = invoiceData.length * 3;
      const filledInvoiceFields = invoiceData.reduce((acc, item) => {
        return (
          acc +
          (item.fabric_sales_sub_color_id.toString().trim() !== "" ? 1 : 0) +
          (item.fabric_sales_thickness.toString().trim() !== "" ? 1 : 0) +
          (item.fabric_sales_weight.toString().trim() !== "" ? 1 : 0)
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
    if (!formData.fabric_sales_date) missingFields.push("Date");
    if (!formData.fabric_sales_vendor_id) missingFields.push("Vendor");

    invoiceData.forEach((row, index) => {
      if (!row.fabric_sales_sub_color_id)
        missingFields.push(`Row ${index + 1}: Color`);
      if (!row.fabric_sales_thickness)
        missingFields.push(`Row ${index + 1}: Thickness`);
      if (!row.fabric_sales_weight)
        missingFields.push(`Row ${index + 1}: Weight`);
      if (!row.fabric_sales_mtr) missingFields.push(`Row ${index + 1}: Meter`);
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

      const url = editId
        ? `${FABRIC_SALE_LIST}/${decryptedId}`
        : FABRIC_SALE_LIST;
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
        navigate("/fabric-sale");
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
        description:
          error?.response?.data?.message || "Failed to save fabric sale",
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
        `${FABRIC_SALE_LIST}/sub/${deleteItemId}`,
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

  if (isFetching || loadingvendor || loadingitem) {
    return <LoaderComponent name="Fabric Sale" />;
  }
  return (
    <Page>
      <div className="p-0">
        <div className="">
          <form onSubmit={handleSubmit} className="w-full ">
            <PageHeaders
              title={editId ? "Update Fabric Sale" : "Create Fabric Sale"}
              subtitle="fabric sale"
              progress={progress}
              mode={editId ? "edit" : "create"}
            />
            <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2  gap-2">
                  <div>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        className="bg-white"
                        value={formData.fabric_sales_date}
                        onChange={(e) =>
                          handleInputChange(e, "fabric_sales_date")
                        }
                        type="date"
                      />
                    </div>
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
                      value={formData.fabric_sales_vendor_id}
                      onChange={(e) =>
                        handleInputChange(e, "fabric_sales_vendor_id")
                      }
                      options={
                        vendorData?.data?.map((vendor) => ({
                          value: vendor.id,
                          label: vendor.vendor_name,
                        })) || []
                      }
                      placeholder="Select Vendor"
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1">
                  <Table className="border border-gray-300 rounded-lg shadow-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span>
                              Color
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span>
                              Thickness
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span>
                              Weight
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <span>
                              Meter
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 text-center w-1/6">
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
                                value={row.fabric_sales_sub_color_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "fabric_sales_sub_color_id"
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
                                  invoiceData[rowIndex]
                                    ?.fabric_sales_thickness || ""
                                }
                                placeholder="Enter Thickness"
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "fabric_sales_thickness"
                                  )
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <Input
                                className="bg-white border border-gray-300 rounded-lg  focus:ring-2 "
                                value={
                                  invoiceData[rowIndex]?.fabric_sales_weight ||
                                  ""
                                }
                                placeholder="Enter Weight"
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "fabric_sales_weight"
                                  )
                                }
                              />
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <Input
                                className="bg-white border border-gray-300 rounded-lg  focus:ring-2 "
                                value={
                                  invoiceData[rowIndex]?.fabric_sales_mtr || ""
                                }
                                placeholder="Enter Meter"
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "fabric_sales_mtr"
                                  )
                                }
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
                  "Update Fabric Sale"
                ) : (
                  "Create Fabric Sale"
                )}{" "}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  navigate("/fabric-sale");
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
        description="fabric sub sale"
        handleDelete={handleDelete}
      />
    </Page>
  );
};

export default FabricSaleForm;
