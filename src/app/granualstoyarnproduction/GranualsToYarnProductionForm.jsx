import { GRANUALS_TO_YARN_PRODUCTION, YARN_FROM_PRODUCTION } from "@/api";
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
import TabbedTableGranualToYarn from "./TabbedTableGranualToYarn";
const fetchGranualsToYarn = async (id, token) => {
  const response = await apiClient.get(`${GRANUALS_TO_YARN_PRODUCTION}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const GranualsToYarnProductionForm = () => {
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
    granuals_to_yp_date: today,
  });

  const [invoiceData, setInvoiceData] = useState([
    {
      id: editId ? "" : null,
      granuals_to_yp_sub_color_id: "",
      granuals_to_yp_bags: "",
      granuals_to_yp_weight: "",
    },
  ]);
  const [invoiceDataOne, setInvoiceDataOne] = useState([
    {
      id: editId ? "" : null,
      yarn_from_p_color_id: "",
      yarn_from_p_bags: "",
      yarn_from_p_weight: "",
      yarn_from_p_thickness: "",
    },
  ]);
  const { data: GranualstoYarn, isFetching } = useQuery({
    queryKey: ["granualstoyarnId", decryptedId],
    queryFn: () => fetchGranualsToYarn(decryptedId, token),
    enabled: !!decryptedId,
  });
  useEffect(() => {
    if (decryptedId && GranualstoYarn?.data) {
      const raw = GranualstoYarn.data;
      setFormData({
        granuals_to_yp_date: raw.granuals_to_yp_date || "",
      });

      const subItems = Array.isArray(GranualstoYarn?.data?.subs)
        ? GranualstoYarn?.data?.subs.map((sub) => ({
            id: sub.id || "",
            granuals_to_yp_sub_color_id: sub.granuals_to_yp_sub_color_id || "",
            granuals_to_yp_bags: sub.granuals_to_yp_bags || "",
            granuals_to_yp_weight: sub.granuals_to_yp_weight || "",
          }))
        : [
            {
              granuals_to_yp_bags: "",
              granuals_to_yp_sub_color_id: "",
              granuals_to_yp_weight: "",
            },
          ];
      const subItemsOne = Array.isArray(GranualstoYarn?.data?.subs1)
        ? GranualstoYarn?.data?.subs1.map((sub) => ({
            id: sub.id || "",
            yarn_from_p_color_id: sub.yarn_from_p_color_id || "",
            yarn_from_p_bags: sub.yarn_from_p_bags || "",
            yarn_from_p_weight: sub.yarn_from_p_weight || "",
            yarn_from_p_thickness: sub.yarn_from_p_thickness || "",
          }))
        : [
            {
              id: "",
              yarn_from_p_color_id: "",
              yarn_from_p_bags: "",
              yarn_from_p_weight: "",
              yarn_from_p_thickness: "",
            },
          ];

      setInvoiceData(subItems);
      setInvoiceDataOne(subItemsOne);
    }
  }, [decryptedId, GranualstoYarn]);

  const { data: colorData, isLoading: loadingcolor } = useFetchColor();

  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
      ...prev,
      {
        granuals_to_yp_bags: "",
        granuals_to_yp_sub_color_id: "",
        granuals_to_yp_weight: "",
      },
    ]);
  }, []);
  const addRowOne = useCallback(() => {
    setInvoiceDataOne((prev) => [
      ...prev,
      {
        yarn_from_p_color_id: "",
        yarn_from_p_bags: "",
        yarn_from_p_weight: "",
        yarn_from_p_thickness: "",
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
      "granuals_to_yp_bags",
      "granuals_to_yp_weight",
      "yarn_from_p_bags",
      "yarn_from_p_weight",
      "yarn_from_p_thickness",
    ];

    if (numericFields.includes(fieldName) && !/^\d*\.?\d*$/.test(value)) {
      console.warn("Invalid input: Only digits are allowed.");
      return;
    }

    if (
      fieldName === "granuals_to_yp_bags" ||
      fieldName === "granuals_to_yp_sub_color_id" ||
      fieldName === "granuals_to_yp_weight"
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
      fieldName === "yarn_from_p_color_id" ||
      fieldName === "yarn_from_p_bags" ||
      fieldName === "yarn_from_p_weight" ||
      fieldName === "yarn_from_p_thickness"
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
          (item.granuals_to_yp_bags?.toString().trim() !== "" ? 1 : 0) +
          (item.granuals_to_yp_sub_color_id?.toString().trim() !== "" ? 1 : 0) +
          (item.granuals_to_yp_weight?.toString().trim() !== "" ? 1 : 0)
        );
      }, 0);

      const totalInvoiceOneFields = invoiceDataOne.length * 4;
      const filledInvoiceOneFields = invoiceDataOne.reduce((acc, item) => {
        return (
          acc +
          (item.yarn_from_p_color_id?.toString().trim() !== "" ? 1 : 0) +
          (item.yarn_from_p_bags?.toString().trim() !== "" ? 1 : 0) +
          (item.yarn_from_p_weight?.toString().trim() !== "" ? 1 : 0) +
          (item.yarn_from_p_thickness?.toString().trim() !== "" ? 1 : 0)
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
    if (!formData.granuals_to_yp_date) missingFields.push("Date");

    invoiceData.forEach((row, index) => {
      if (!row.granuals_to_yp_bags)
        missingFields.push(`Row ${index + 1}: Bags`);
      if (!row.granuals_to_yp_sub_color_id)
        missingFields.push(`Row ${index + 1}: Color`);
      if (!row.granuals_to_yp_weight)
        missingFields.push(`Row ${index + 1}: Weight`);
    });

    invoiceDataOne.forEach((row, index) => {
      const {
        yarn_from_p_color_id: yarn_from_p_color_id,
        yarn_from_p_bags: yarn_from_p_bags,
        yarn_from_p_weight: yarn_from_p_weight,
        yarn_from_p_thickness: yarn_from_p_thickness,
      } = row;

      const isAnyFieldFilled =
        yarn_from_p_color_id?.toString().trim() !== "" ||
        yarn_from_p_bags?.toString().trim() !== "" ||
        yarn_from_p_weight?.toString().trim() !== "";
      yarn_from_p_thickness?.toString().trim() !== "";

      if (isAnyFieldFilled) {
        if (!yarn_from_p_color_id)
          missingFields.push(`Yarn Row ${index + 1}: Color`);
        if (!yarn_from_p_bags)
          missingFields.push(`Yarn Row ${index + 1}: Bags`);
        if (!yarn_from_p_weight)
          missingFields.push(`Yarn Row ${index + 1}: Weight`);
        if (!yarn_from_p_thickness)
          missingFields.push(`Yarn Row ${index + 1}: Thickness`);
      }
    });
    // const cleanedInvoiceDataOne = invoiceDataOne.filter((row) => {
    //   return (
    //     row.yarn_from_p_color_id?.toString().trim() !== "" ||
    //     row.yarn_from_p_bags?.toString().trim() !== "" ||
    //     row.yarn_from_p_weight?.toString().trim() !== "" ||
    //     row.yarn_from_p_thickness?.toString().trim() !== ""
    //   );
    // });
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
          row.yarn_from_p_color_id?.toString().trim() !== "" ||
          row.yarn_from_p_bags?.toString().trim() !== "" ||
          row.yarn_from_p_weight?.toString().trim() !== "" ||
          row.yarn_from_p_thickness?.toString().trim() !== ""
        );
      });
      const payload = {
        ...formData,
        subs: invoiceData,
        ...(isEdit || hasValidGranualsData ? { subs1: invoiceDataOne } : {}),
      };

      const url = editId
        ? `${GRANUALS_TO_YARN_PRODUCTION}/${decryptedId}`
        : GRANUALS_TO_YARN_PRODUCTION;
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
        navigate("/granuals");
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
  const handleDeleteGranualSub = (productId) => {
    setDeleteConfirmOpen(true);
    setDeleteItemId(productId);
  };
  const handleDeleteYarnSub = (productId) => {
    setDeleteConfirmOpen1(true);
    setDeleteItemId1(productId);
  };
  const handleDeleteGranual = async () => {
    try {
      const response = await apiClient.delete(
        `${GRANUALS_TO_YARN_PRODUCTION}/sub/${deleteItemId}`,
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
  const handleDeleteYarn = async () => {
    try {
      const response = await apiClient.delete(
        `${YARN_FROM_PRODUCTION}/${deleteItemId1}`,
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
    return <LoaderComponent name="Granual To Yarn Production" />;
  }
  return (
    <Page>
      <div className="p-0">
        <div className="">
          <form onSubmit={handleSubmit} className="w-full ">
            <PageHeaders
              title={
                editId
                  ? "Update Granual Production"
                  : "Create Granual Production"
              }
              subtitle="granual production"
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
                        value={formData.granuals_to_yp_date}
                        onChange={(e) =>
                          handleInputChange(e, "granuals_to_yp_date")
                        }
                        type="date"
                      />
                    </div>
                  </div>
                </div>

                <TabbedTableGranualToYarn
                  granualsRows={invoiceData}
                  YarnRows={invoiceDataOne}
                  colorData={colorData}
                  handleChange={handlePaymentChange}
                  addGranualsRow={addRow}
                  addYarnRow={addRowOne}
                  removeGranualsRow={removeRow}
                  removeYarnRow={removeRowOne}
                  deleteRowGranuals={handleDeleteGranualSub}
                  deleteRowYarn={handleDeleteYarnSub}
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
                  navigate("/granuals");
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
        description="Granuals Production Sub"
        handleDelete={handleDeleteGranual}
      />

      <DeleteAlertDialog
        open={deleteConfirmOpen1}
        onOpenChange={setDeleteConfirmOpen1}
        description="Yarn Production Sub"
        handleDelete={handleDeleteYarn}
      />
    </Page>
  );
};

export default GranualsToYarnProductionForm;
