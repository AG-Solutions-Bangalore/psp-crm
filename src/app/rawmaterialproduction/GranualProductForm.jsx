import { GRANUALS_PRODUCTION_LIST, RAW_MATERIAL_PRODUCTION_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/page/page";
import { MemoizedProductSelect } from "@/components/common/MemoizedProductSelect";
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
import { useFetchColor } from "@/hooks/useApi";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MinusCircle, PlusCircle } from "lucide-react";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const GranualProductForm = () => {
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

  const { toast } = useToast();
  const navigate = useNavigate();
  const today = moment().format("YYYY-MM-DD");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const token = usetoken();
  const getFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    // Assuming financial year starts in April
    if (month >= 4) {
      return `${year}-${(year + 1).toString().slice(-2)}`;
    } else {
      return `${year - 1}-${year.toString().slice(-2)}`;
    }
  };

  const financialYear = getFinancialYear();
  const [formData, setFormData] = useState({
    year: financialYear,
    raw_material_to_p_date: today,
    raw_material_to_p_ref: "",
  });
  console.log(formData);
  const [invoiceData, setInvoiceData] = useState([
    {
      granuals_from_p_color_id: "",
      granuals_from_p_bags: "",
      granuals_from_p_weight: "",
    },
  ]);
  const { data: GranualProductionById, isFetching } = useQuery({
    queryKey: ["granualbyId", decryptedId],
    queryFn: () => fetchRawMaterialById(decryptedId, token),
    enabled: !!decryptedId,
  });
  useEffect(() => {
    if (decryptedId && GranualProductionById?.data) {
      const raw = GranualProductionById.data;
      setFormData({
        year: financialYear || "",
        raw_material_to_p_date: raw.raw_material_to_p_date || "",
        raw_material_to_p_ref: raw.raw_material_to_p_ref || "",
      });
    }
  }, [decryptedId, GranualProductionById]);

  const { data: colorData, isLoading: loadingitem } = useFetchColor();

  const addRow = useCallback(() => {
    setInvoiceData((prev) => [
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

  const handlePaymentChange = (selectedValue, rowIndex, fieldName) => {
    const value =
      selectedValue?.target?.value !== undefined
        ? selectedValue.target.value
        : selectedValue;

    if (
      (fieldName === "granuals_from_p_bags" ||
        fieldName === "granuals_from_p_weight") &&
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
          (item.granuals_from_p_color_id.toString().trim() !== "" ? 1 : 0) +
          (item.granuals_from_p_bags.toString().trim() !== "" ? 1 : 0) +
          (item.granuals_from_p_weight.toString().trim() !== "" ? 1 : 0)
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
    if (!formData.year) missingFields.push("Year");
    if (!formData.raw_material_to_p_date) missingFields.push("Date");
    if (!formData.raw_material_to_p_ref) missingFields.push("Ref");

    invoiceData.forEach((row, index) => {
      if (!row.granuals_from_p_color_id)
        missingFields.push(`Row ${index + 1}: Color`);
      if (!row.granuals_from_p_bags)
        missingFields.push(`Row ${index + 1}: Bags`);
      if (!row.granuals_from_p_weight)
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
        subs1: invoiceData,
      };

      const response = await apiClient.post(GRANUALS_PRODUCTION_LIST, payload, {
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
        description: error?.response?.data?.message || "Failed to save granual",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching || loadingitem) {
    return <LoaderComponent name="Granuals" />;
  }
  return (
    <Page>
      <div className="p-0">
        <div className="">
          <form onSubmit={handleSubmit} className="w-full ">
            <PageHeaders
              title={"Create Production Granuals"}
              subtitle="granuals"
              progress={progress}
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
                        value={formData.raw_material_to_p_date}
                        type="date"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                    >
                      Ref<span className="text-red-500">*</span>
                    </label>
                    <Input
                      className="bg-white border border-gray-300 rounded-lg w-full focus:ring-2 "
                      value={formData.raw_material_to_p_ref}
                      onChange={(e) =>
                        handleInputChange(e, "raw_material_to_p_ref")
                      }
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1">
                  <Table className="border border-gray-300 rounded-lg shadow-sm">
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 w-[30%]">
                          <div className="flex items-center justify-between">
                            <span>
                              Color
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 w-[30%]">
                          <div className="flex items-center justify-between">
                            <span>
                              Bags
                              <span className="text-red-500 ml-1 text-xs">
                                *
                              </span>
                            </span>
                          </div>
                        </TableHead>
                        <TableHead className="text-sm font-semibold text-gray-600 px-4 py-3 w-[30%]">
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
                                value={row.granuals_from_p_color_id}
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "granuals_from_p_color_id"
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
                                className="bg-white border border-gray-300 rounded-lg  "
                                value={
                                  invoiceData[rowIndex]?.granuals_from_p_bags ||
                                  ""
                                }
                                placeholder="Enter Bags"
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "granuals_from_p_bags"
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
                                  invoiceData[rowIndex]
                                    ?.granuals_from_p_weight || ""
                                }
                                placeholder="Enter Weight"
                                onChange={(e) =>
                                  handlePaymentChange(
                                    e,
                                    rowIndex,
                                    "granuals_from_p_weight"
                                  )
                                }
                                maxLength={10}
                              />
                            </div>
                          </TableCell>

                          <TableCell className="p-2 align-middle">
                            <Button
                              variant="ghost"
                              onClick={() => removeRow(rowIndex)}
                              disabled={invoiceData.length === 1}
                              className="text-red-500"
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
                    {"Creating..."}
                  </>
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
    </Page>
  );
};

export default GranualProductForm;
