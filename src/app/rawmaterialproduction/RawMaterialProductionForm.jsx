import { GRANUALS_PRODUCTION_LIST, RAW_MATERIAL_PRODUCTION_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/page/page";
import DeleteAlertDialog from "@/components/common/DeleteAlertDialog";
import PageHeaders from "@/components/common/PageHeaders";
import { LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchColor, useFetchItem } from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TabbedTable from "./TabbedTable";
const fetchRawMaterialById = async (id, token) => {
  const response = await apiClient.get(
    `${RAW_MATERIAL_PRODUCTION_LIST}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const RawMaterialProductionForm = () => {
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
  const [deleteConfirmOpen1, setDeleteConfirmOpen1] = useState(false);
  const [deleteItemId1, setDeleteItemId1] = useState(null);

  const editId = Boolean(id);
  const { toast } = useToast();
  const navigate = useNavigate();
  const today = moment().format("YYYY-MM-DD");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const token = usetoken();

  const [formData, setFormData] = useState({
    raw_material_to_p_date: today,
  });

  const [invoiceData, setInvoiceData] = useState([
    {
      id: editId ? "" : null,
      raw_material_sub_to_p_item_id: "",
      raw_material_sub_to_p_weight: "",
    },
  ]);
  const [invoiceDataOne, setInvoiceDataOne] = useState([
    {
      id: editId ? "" : null,
      granuals_from_p_color_id: "",
      granuals_from_p_bags: "",
      granuals_from_p_weight: "",
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
        raw_material_to_p_date: raw.raw_material_to_p_date || "",
      });

      const subItems = Array.isArray(rawMaterialById?.data?.subs)
        ? rawMaterialById?.data?.subs.map((sub) => ({
            id: sub.id || "",
            raw_material_sub_to_p_item_id:
              sub.raw_material_sub_to_p_item_id || "",
            raw_material_sub_to_p_weight:
              sub.raw_material_sub_to_p_weight || "",
          }))
        : [
            {
              raw_material_sub_to_p_item_id: "",
              raw_material_sub_to_p_weight: "",
            },
          ];

      const subItemsOne = Array.isArray(rawMaterialById?.data?.subs1)
        ? rawMaterialById.data.subs1.map((sub) => ({
            id: sub.id || "",
            granuals_from_p_color_id: sub.granuals_from_p_color_id || "",
            granuals_from_p_bags: sub.granuals_from_p_bags || "",
            granuals_from_p_weight: sub.granuals_from_p_weight || "",
          }))
        : [
            {
              id: "",
              granuals_from_p_color_id: "",
              granuals_from_p_bags: "",
              granuals_from_p_weight: "",
            },
          ];
      setInvoiceData(subItems);
      setInvoiceDataOne(subItemsOne);
    }
  }, [decryptedId, rawMaterialById]);

  const { data: itemData, isLoading: loadingitem } = useFetchItem();
  const { data: colorData, isLoading: loadingcolor } = useFetchColor();

  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        raw_material_sub_to_p_item_id: "",
        raw_material_sub_to_p_weight: "",
      },
    ]);
  }, []);
  const addRowOne = useCallback(() => {
    setInvoiceDataOne((prev) => [
      ...prev,
      {
        granuals_from_p_color_id: "",
        granuals_from_p_bags: "",
        granuals_from_p_weight: "",
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
  const removeRowOne = useCallback(
    (index) => {
      if (invoiceDataOne.length > 1) {
        setInvoiceDataOne((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [invoiceDataOne.length]
  );

  const handlePaymentChange = (selectedValue, rowIndex, fieldName) => {
    const value =
      selectedValue?.target?.value !== undefined
        ? selectedValue.target.value
        : selectedValue;

    const numericFields = [
      "raw_material_sub_to_p_weight",
      "granuals_from_p_bags",
      "granuals_from_p_weight",
    ];

    if (numericFields.includes(fieldName) && !/^\d*\.?\d*$/.test(value)) {
      console.warn("Invalid input: Only digits are allowed.");
      return;
    }

    if (
      fieldName === "raw_material_sub_to_p_item_id" ||
      fieldName === "raw_material_sub_to_p_weight"
    ) {
      setInvoiceData((prevData) => {
        const updatedData = [...prevData];
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [fieldName]: value,
        };
        return updatedData;
      });
    } else if (
      fieldName === "granuals_from_p_color_id" ||
      fieldName === "granuals_from_p_bags" ||
      fieldName === "granuals_from_p_weight"
    ) {
      setInvoiceDataOne((prevData) => {
        const updatedData = [...prevData];
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [fieldName]: value,
        };
        return updatedData;
      });
    }
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
        (value) => value?.toString().trim() !== ""
      ).length;

      const totalInvoiceFields = invoiceData.length * 2;
      const filledInvoiceFields = invoiceData.reduce((acc, item) => {
        return (
          acc +
          (item.raw_material_sub_to_p_item_id?.toString().trim() !== ""
            ? 1
            : 0) +
          (item.raw_material_sub_to_p_weight?.toString().trim() !== "" ? 1 : 0)
        );
      }, 0);

      const totalInvoiceOneFields = invoiceDataOne.length * 3;
      const filledInvoiceOneFields = invoiceDataOne.reduce((acc, item) => {
        return (
          acc +
          (item.granuals_from_p_color_id?.toString().trim() !== "" ? 1 : 0) +
          (item.granuals_from_p_bags?.toString().trim() !== "" ? 1 : 0) +
          (item.granuals_from_p_weight?.toString().trim() !== "" ? 1 : 0)
        );
      }, 0);

      const totalFields =
        totalFormFields + totalInvoiceFields + totalInvoiceOneFields;
      const filledFields =
        filledFormFields + filledInvoiceFields + filledInvoiceOneFields;

      const percentage =
        totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 100);
      setProgress(percentage);
    };

    calculateProgress();
  }, [formData, invoiceData, invoiceDataOne]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const missingFields = [];
    if (!formData.raw_material_to_p_date) missingFields.push("Date");

    invoiceData.forEach((row, index) => {
      if (!row.raw_material_sub_to_p_item_id)
        missingFields.push(`Row ${index + 1}: Item`);
      if (!row.raw_material_sub_to_p_weight)
        missingFields.push(`Row ${index + 1}: Weight`);
    });

    invoiceDataOne.forEach((row, index) => {
      const {
        granuals_from_p_color_id,
        granuals_from_p_bags,
        granuals_from_p_weight,
      } = row;

      const isAnyFieldFilled =
        granuals_from_p_color_id?.toString().trim() !== "" ||
        granuals_from_p_bags?.toString().trim() !== "" ||
        granuals_from_p_weight?.toString().trim() !== "";

      if (isAnyFieldFilled) {
        if (!granuals_from_p_color_id)
          missingFields.push(`Granuals Row ${index + 1}: Color`);
        if (!granuals_from_p_bags)
          missingFields.push(`Granuals Row ${index + 1}: Bags`);
        if (!granuals_from_p_weight)
          missingFields.push(`Granuals Row ${index + 1}: Weight`);
      }
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
      const hasRawMaterialData = invoiceDataOne.some((row) => {
        return (
          row.granuals_from_p_color_id?.toString().trim() !== "" ||
          row.granuals_from_p_bags?.toString().trim() !== "" ||
          row.granuals_from_p_weight?.toString().trim() !== ""
        );
      });
      const payload = {
        ...formData,
        subs: invoiceData,
        ...(isEdit || hasRawMaterialData ? { subs1: invoiceDataOne } : {}),
      };

      const url = editId
        ? `${RAW_MATERIAL_PRODUCTION_LIST}/${decryptedId}`
        : RAW_MATERIAL_PRODUCTION_LIST;
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
  const handleDeleteRow1 = (productId) => {
    setDeleteConfirmOpen1(true);
    setDeleteItemId1(productId);
  };
  const handleDelete = async () => {
    try {
      const response = await apiClient.delete(
        `${RAW_MATERIAL_PRODUCTION_LIST}/sub/${deleteItemId}`,
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
  const handleDelete1 = async () => {
    try {
      const response = await apiClient.delete(
        `${GRANUALS_PRODUCTION_LIST}/${deleteItemId1}`,
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

        setInvoiceDataOne((prevData) =>
          prevData.filter((row) => row.id !== deleteItemId1)
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
      setDeleteConfirmOpen1(false);
      setDeleteItemId1(null);
    }
  };
  if (isFetching || loadingitem || loadingcolor) {
    return <LoaderComponent name="Raw Material Production" />;
  }
  return (
    <Page>
      <div className="p-0">
        <div className="">
          <form onSubmit={handleSubmit} className="w-full ">
            <PageHeaders
              title={
                editId
                  ? "Update Raw Material Production"
                  : "Create Raw Material Production "
              }
              subtitle="raw material production"
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
                        value={formData.raw_material_to_p_date}
                        onChange={(e) =>
                          handleInputChange(e, "raw_material_to_p_date")
                        }
                        type="date"
                      />
                    </div>
                  </div>
                </div>

                <TabbedTable
                  rawMaterialRows={invoiceData}
                  granualsRows={invoiceDataOne}
                  itemData={itemData}
                  colorData={colorData}
                  handleChange={handlePaymentChange}
                  addRawRow={addRow}
                  addGranualsRow={addRowOne}
                  removeRawRow={removeRow}
                  removeGranualsRow={removeRowOne}
                  deleteRow={handleDeleteRow}
                  deleteRow1={handleDeleteRow1}
                />
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
        description="Raw Material Production Sub"
        handleDelete={handleDelete}
      />

      <DeleteAlertDialog
        open={deleteConfirmOpen1}
        onOpenChange={setDeleteConfirmOpen1}
        description="Granual Production Sub"
        handleDelete={handleDelete1}
      />
    </Page>
  );
};

export default RawMaterialProductionForm;
