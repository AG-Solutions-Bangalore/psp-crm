import { RAW_MATERIAL_LIST } from "@/api";
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
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchItem, useFetchVendor } from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
const fetchRawMaterialById = async (id, token) => {
  const response = await apiClient.get(`${RAW_MATERIAL_LIST}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const RawMaterialForm = () => {
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
    raw_material_date: today,
    raw_material_bill_ref: "",
    raw_material_vendor_id: "",
  });

  const [invoiceData, setInvoiceData] = useState([
    {
      id: editId ? "" : null,
      raw_material_sub_item_id: "",
      raw_material_sub_weight: "",
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
        raw_material_date: raw.raw_material_date || "",
        raw_material_bill_ref: raw.raw_material_bill_ref || "",
        raw_material_vendor_id: raw.raw_material_vendor_id || "",
      });

      const subItems = Array.isArray(rawMaterialById?.data?.subs)
        ? rawMaterialById?.data?.subs.map((sub) => ({
            id: sub.id || "",
            raw_material_sub_item_id: sub.raw_material_sub_item_id || "",
            raw_material_sub_weight: sub.raw_material_sub_weight || "",
          }))
        : [
            {
              raw_material_sub_item_id: "",
              raw_material_sub_weight: "",
            },
          ];

      setInvoiceData(subItems);
    }
  }, [decryptedId, rawMaterialById]);

  const { data: vendorData, isLoading: loadingvendor } = useFetchVendor();
  const { data: itemData, isLoading: loadingitem } = useFetchItem();

  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        raw_material_sub_item_id: "",
        raw_material_sub_weight: "",
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

    if (fieldName === "raw_material_sub_weight" && !/^\d*\.?\d*$/.test(value)) {
      console.warn("Invalid input: Only digits are allowed for weight.");
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
    console.log(value);
    let updatedFormData = { ...formData, [field]: value };

    setFormData(updatedFormData);
  };
  useEffect(() => {
    const calculateProgress = () => {
      const totalFormFields = Object.keys(formData).length;
      const filledFormFields = Object.values(formData).filter(
        (value) => value.toString().trim() !== ""
      ).length;

      const totalInvoiceFields = invoiceData.length * 2;
      const filledInvoiceFields = invoiceData.reduce((acc, item) => {
        return (
          acc +
          (item.raw_material_sub_item_id.toString().trim() !== "" ? 1 : 0) +
          (item.raw_material_sub_weight.toString().trim() !== "" ? 1 : 0)
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
    if (!formData.raw_material_date) missingFields.push("Date");
    if (!formData.raw_material_bill_ref) missingFields.push("Bill Ref");
    if (!formData.raw_material_vendor_id) missingFields.push("Vendor");

    invoiceData.forEach((row, index) => {
      if (!row.raw_material_sub_item_id)
        missingFields.push(`Row ${index + 1}: Item`);
      if (!row.raw_material_sub_weight)
        missingFields.push(`Row ${index + 1}: Weight`);
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
        ? `${RAW_MATERIAL_LIST}/${decryptedId}`
        : RAW_MATERIAL_LIST;
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
        navigate("/raw-material");
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
          error?.response?.data?.message || "Failed to save raw material",
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
        `${RAW_MATERIAL_LIST}/sub/${deleteItemId}`,
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
    return <LoaderComponent name="Raw Data" />;
  }
  return (
    <Page>
      <div className="p-0">
        <div className="">
          <form onSubmit={handleSubmit} className="w-full ">
            <PageHeaders
              title={editId ? "Update Raw Material" : "Create Raw Material"}
              subtitle="raw material"
              progress={progress}
              mode={editId ? "edit" : "create"}
            />
            <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div>
                    <div>
                      <label
                        className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                      >
                        Date <span className="text-red-500">*</span>
                      </label>
                      <Input
                        className="bg-white"
                        value={formData.raw_material_date}
                        onChange={(e) =>
                          handleInputChange(e, "raw_material_date")
                        }
                        type="date"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Bill Ref<span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 "
                      value={formData.raw_material_bill_ref}
                      onChange={(e) =>
                        handleInputChange(e, "raw_material_bill_ref")
                      }
                      maxLength={50}
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
                      value={formData.raw_material_vendor_id}
                      onChange={(e) =>
                        handleInputChange(e, "raw_material_vendor_id")
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
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 w-[40%]">
                          <div className="flex items-center justify-between">
                            <span>
                              Item
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 w-[40%]">
                          <div className="flex items-center justify-between">
                            <span>
                              Weight
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
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
                                value={row.raw_material_sub_item_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "raw_material_sub_item_id"
                                  )
                                }
                                options={
                                  itemData?.data?.map((item) => ({
                                    value: item.id,
                                    label: item.item_name,
                                  })) || []
                                }
                                placeholder="Select Item"
                              />
                            </div>
                          </TableCell>

                          <TableCell className="px-4 py-3 align-top">
                            <div className="flex flex-col gap-1">
                              <Input
                                className="bg-white border border-gray-300 rounded-lg  "
                                value={
                                  invoiceData[rowIndex]
                                    ?.raw_material_sub_weight || ""
                                }
                                placeholder="Enter Weight"
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "raw_material_sub_weight"
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
                  "Update"
                ) : (
                  "Submit"
                )}{" "}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  navigate("/raw-material");
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
        description="Raw Material Sub"
        handleDelete={handleDelete}
      />
    </Page>
  );
};

export default RawMaterialForm;
