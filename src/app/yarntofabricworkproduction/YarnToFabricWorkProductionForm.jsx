import { FABRIC_WORK_PRODUCTION, YARN_TO_FABRIC_WORK_PRODUCTION } from "@/api";
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
import { useFetchColor } from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TabbedTableYarnToFabricWorkProduction from "./TabbedTableYarnToFabricWorkProduction";
const fetchYarnToFabricWork = async (id, token) => {
  const response = await apiClient.get(
    `${YARN_TO_FABRIC_WORK_PRODUCTION}/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const YarnToFabricWorkProductionForm = () => {
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
    yarn_to_fwp_date: today,
  });

  const [invoiceData, setInvoiceData] = useState([
    {
      id: editId ? "" : null,
      yarn_to_fwp_sub_color_id: "",
      yarn_to_fwp_thickness: "",
      yarn_to_fwp_weight: "",
    },
  ]);
  const [invoiceDataOne, setInvoiceDataOne] = useState([
    {
      id: editId ? "" : null,
      fabric_from_wp_color_id: "",
      fabric_from_wp_mtr: "",
      fabric_from_wp_weight: "",
      fabric_from_wp_thickness: "",
    },
  ]);

  const { data: YarnToWork, isFetching } = useQuery({
    queryKey: ["yarntofabricworkId", decryptedId],
    queryFn: () => fetchYarnToFabricWork(decryptedId, token),
    enabled: !!decryptedId,
  });
  useEffect(() => {
    if (decryptedId && YarnToWork?.data) {
      const raw = YarnToWork.data;
      setFormData({
        yarn_to_fwp_date: raw.yarn_to_fwp_date || "",
      });

      const subItems = Array.isArray(YarnToWork?.data?.subs)
        ? YarnToWork?.data?.subs.map((sub) => ({
            id: sub.id || "",
            yarn_to_fwp_sub_color_id: sub.yarn_to_fwp_sub_color_id || "",
            yarn_to_fwp_thickness: sub.yarn_to_fwp_thickness || "",
            yarn_to_fwp_weight: sub.yarn_to_fwp_weight || "",
          }))
        : [
            {
              yarn_to_fwp_thickness: "",
              yarn_to_fwp_sub_color_id: "",
              yarn_to_fwp_weight: "",
            },
          ];
      const subItemsOne = Array.isArray(YarnToWork?.data?.subs1)
        ? YarnToWork?.data?.subs1.map((sub) => ({
            id: sub.id || "",
            fabric_from_wp_color_id: sub.fabric_from_wp_color_id || "",
            fabric_from_wp_mtr: sub.fabric_from_wp_mtr || "",
            fabric_from_wp_weight: sub.fabric_from_wp_weight || "",
            fabric_from_wp_thickness: sub.fabric_from_wp_thickness || "",
          }))
        : [
            {
              id: "",
              fabric_from_wp_color_id: "",
              fabric_from_wp_mtr: "",
              fabric_from_wp_weight: "",
              fabric_from_wp_thickness: "",
            },
          ];

      setInvoiceData(subItems);
      setInvoiceDataOne(subItemsOne);
    }
  }, [decryptedId, YarnToWork]);

  const { data: colorData, isLoading: loadingcolor } = useFetchColor();

  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        yarn_to_fwp_thickness: "",
        yarn_to_fwp_sub_color_id: "",
        yarn_to_fwp_weight: "",
      },
    ]);
  }, []);
  const addRowOne = useCallback(() => {
    setInvoiceDataOne((prev) => [
      ...prev,
      {
        fabric_from_wp_color_id: "",
        fabric_from_wp_mtr: "",
        fabric_from_wp_weight: "",
        fabric_from_wp_thickness: "",
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
      "yarn_to_fwp_thickness",
      "yarn_to_fwp_weight",
      "fabric_from_wp_mtr",
      "fabric_from_wp_weight",
      "fabric_from_wp_thickness",
    ];

    if (numericFields.includes(fieldName) && !/^\d*\.?\d*$/.test(value)) {
      console.warn("Invalid input: Only digits are allowed.");
      return;
    }

    if (
      fieldName === "yarn_to_fwp_thickness" ||
      fieldName === "yarn_to_fwp_sub_color_id" ||
      fieldName === "yarn_to_fwp_weight"
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
      fieldName === "fabric_from_wp_color_id" ||
      fieldName === "fabric_from_wp_mtr" ||
      fieldName === "fabric_from_wp_weight" ||
      fieldName === "fabric_from_wp_thickness"
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

      const totalInvoiceFields = invoiceData.length * 3;
      const filledInvoiceFields = invoiceData.reduce((acc, item) => {
        return (
          acc +
          (item.yarn_to_fwp_thickness?.toString().trim() !== "" ? 1 : 0) +
          (item.yarn_to_fwp_sub_color_id?.toString().trim() !== "" ? 1 : 0) +
          (item.yarn_to_fwp_weight?.toString().trim() !== "" ? 1 : 0)
        );
      }, 0);

      const totalInvoiceOneFields = invoiceDataOne.length * 4;
      const filledInvoiceOneFields = invoiceDataOne.reduce((acc, item) => {
        return (
          acc +
          (item.fabric_from_wp_color_id?.toString().trim() !== "" ? 1 : 0) +
          (item.fabric_from_wp_mtr?.toString().trim() !== "" ? 1 : 0) +
          (item.fabric_from_wp_weight?.toString().trim() !== "" ? 1 : 0) +
          (item.fabric_from_wp_thickness?.toString().trim() !== "" ? 1 : 0)
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
    if (!formData.yarn_to_fwp_date) missingFields.push("Date");

    invoiceData.forEach((row, index) => {
      if (!row.yarn_to_fwp_thickness)
        missingFields.push(`Row ${index + 1}: Bags`);
      if (!row.yarn_to_fwp_sub_color_id)
        missingFields.push(`Row ${index + 1}: Color`);
      if (!row.yarn_to_fwp_weight)
        missingFields.push(`Row ${index + 1}: Weight`);
    });

    invoiceDataOne.forEach((row, index) => {
      const {
        fabric_from_wp_color_id: fabric_from_wp_color_id,
        fabric_from_wp_mtr: fabric_from_wp_mtr,
        fabric_from_wp_weight: fabric_from_wp_weight,
        fabric_from_wp_thickness: fabric_from_wp_thickness,
      } = row;

      const isAnyFieldFilled =
        fabric_from_wp_color_id?.toString().trim() !== "" ||
        fabric_from_wp_mtr?.toString().trim() !== "" ||
        fabric_from_wp_weight?.toString().trim() !== "";
      fabric_from_wp_thickness?.toString().trim() !== "";

      if (isAnyFieldFilled) {
        if (!fabric_from_wp_color_id)
          missingFields.push(`Fabric Row ${index + 1}: Color`);
        if (!fabric_from_wp_mtr)
          missingFields.push(`Fabric Row ${index + 1}: Meter`);
        if (!fabric_from_wp_weight)
          missingFields.push(`Fabric Row ${index + 1}: Weight`);
        if (!fabric_from_wp_thickness)
          missingFields.push(`Fabric Row ${index + 1}: Thickness`);
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
      const hasValidGranualsData = invoiceDataOne.some((row) => {
        return (
          row.fabric_from_wp_color_id?.toString().trim() !== "" ||
          row.fabric_from_wp_mtr?.toString().trim() !== "" ||
          row.fabric_from_wp_weight?.toString().trim() !== "" ||
          row.fabric_from_wp_thickness?.toString().trim() !== ""
        );
      });

      const payload = {
        ...formData,
        subs: invoiceData,

        ...(isEdit || hasValidGranualsData ? { subs1: invoiceDataOne } : {}),
      };

      const url = editId
        ? `${YARN_TO_FABRIC_WORK_PRODUCTION}/${decryptedId}`
        : YARN_TO_FABRIC_WORK_PRODUCTION;
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
        navigate("/yarn");
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
  const handleDeleteYarnSub = (productId) => {
    setDeleteConfirmOpen(true);
    setDeleteItemId(productId);
  };
  const handleDeleteFabricSub = (productId) => {
    setDeleteConfirmOpen1(true);
    setDeleteItemId1(productId);
  };
  const handleDeleteYarn = async () => {
    try {
      const response = await apiClient.delete(
        `${YARN_TO_FABRIC_WORK_PRODUCTION}/sub/${deleteItemId}`,
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
  const handleDeleteFabric = async () => {
    try {
      const response = await apiClient.delete(
        `${FABRIC_WORK_PRODUCTION}/${deleteItemId1}`,
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
  if (isFetching || loadingcolor) {
    return <LoaderComponent name="Yarn To Fabric Production" />;
  }
  return (
    <Page>
      <div className="p-0">
        <div className="">
          <form onSubmit={handleSubmit} className="w-full ">
            <PageHeaders
              title={editId ? "Update Yarn Job Work" : "Create Yarn Job Work"}
              subtitle="yarn job work production"
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
                        value={formData.yarn_to_fwp_date}
                        onChange={(e) =>
                          handleInputChange(e, "yarn_to_fwp_date")
                        }
                        type="date"
                      />
                    </div>
                  </div>
                </div>

                <TabbedTableYarnToFabricWorkProduction
                  YarnRows={invoiceData}
                  FabricRows={invoiceDataOne}
                  colorData={colorData}
                  handleChange={handlePaymentChange}
                  addYarnRow={addRow}
                  addFabricRow={addRowOne}
                  removeYarnRow={removeRow}
                  removeFabricRow={removeRowOne}
                  deleteRowYarn={handleDeleteYarnSub}
                  deleteRowFabric={handleDeleteFabricSub}
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
                  navigate("/yarn");
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
        description="Yarn  Production Sub"
        handleDelete={handleDeleteYarn}
      />

      <DeleteAlertDialog
        open={deleteConfirmOpen1}
        onOpenChange={setDeleteConfirmOpen1}
        description="Fabric Job Work Sub"
        handleDelete={handleDeleteFabric}
      />
    </Page>
  );
};

export default YarnToFabricWorkProductionForm;
