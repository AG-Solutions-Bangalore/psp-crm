import Page from "../dashboard/page";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import { ChevronDown, ChevronsUpDown, Loader2 } from "lucide-react";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useFetchShipper, useFetchVessel } from "@/hooks/useApi";
import BASE_URL from "@/config/BaseUrl";
import { decryptId } from "@/utils/encyrption/Encyrption";
import ReactSelect from "react-select";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

const DocumentHeader = ({ documentDetails }) => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Document Invoice</h1>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {documentDetails?.invoice?.invoice_ref || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-600 mt-2">Update invoice document details</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="font-medium">{/* - */}</span>
        </div>
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="font-medium">{/* - */}</span>
        </div>
      </div>
    </div>
  );
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
          <ChevronsUpDown className="h-3 w-3 mr-3 text-gray-400" />
        </div>
      );
    };

    return (
      <ReactSelect
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
const InvoiceDocumentEdit = () => {
  const updateBranch = async ({ decryptedId, data }) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(
      `${BASE_URL}/api/panel-update-invoice-document/${decryptedId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) throw new Error("Failed to update doucment invoice");
    return response.json();
  };
  const { id } = useParams();
  const decryptedId = decryptId(id);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [expectedFob, setExpectedFob] = useState(0);
  console.log(expectedFob, "expectedFob");
  const [formData, setFormData] = useState({
    invoice_ref: "",
    invoice_bl_no: "",
    invoice_bl_date: "",
    invoice_sb_no: "",
    invoice_sb_date: "",
    invoice_container: "",
    invoice_voyage: "",
    invoice_seal: "",
    invoice_shipper: "",
    invoice_etd_date: "",
    invoice_eta_date: "",
    invoice_i_value_usd: "",
    invoice_i_value_inr: "",
    invoice_fob_usd: "",
    invoice_fob_inr: "",
    invoice_exch_rate: "",
    invoice_let_exports_date: "",
    invoice_vessel: "",
    invoice_insurance: "",
    invoice_freight: "",
  });
  console.log(formData.invoice_fob_usd, "formData.invoice_fob_usd");

  const { data: vesselData } = useFetchVessel();
  const { data: shipperData } = useFetchShipper();
  // Fetch branch data by ID
  const {
    data: documentDetails,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["documentData", decryptedId],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-invoice-document-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch document invoice");
      return response.json();
    },
    staleTime: 0,
    cacheTime: 0,
  });

  useEffect(() => {
    if (documentDetails?.invoice) {
      setFormData((prev) => ({
        ...prev,
        ...documentDetails.invoice,
      }));
    }
  }, [documentDetails]);
  useEffect(() => {
    if (
      vesselData?.vessel?.length > 0 &&
      shipperData?.shipper?.length > 0 &&
      documentDetails?.invoice
    ) {
      setFormData((prev) => ({
        ...prev,
        invoice_vessel: documentDetails.invoice.invoice_vessel || "",
        invoice_shipper: documentDetails.invoice.invoice_shipper || "",
      }));
    }
  }, [vesselData, shipperData, documentDetails]);

  const updateBranchMutation = useMutation({
    mutationFn: updateBranch,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Documents updated successfully",
      });
      queryClient.invalidateQueries(["documentData", decryptedId]);
      queryClient.refetchQueries(["documentData", decryptedId]);
      navigate("/invoice");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDecimalInputChange = (e, field) => {
    let value = e.target.value;

    if (!/^\d*\.?\d*$/.test(value)) {
      return;
    }

    if ((value.match(/\./g) || []).length > 1) {
      return;
    }
    const parts = value.split(".");
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + "." + parts[1].slice(0, 2);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDecimal = (value) => {
    if (!value) return "";
    return Number(value).toFixed(2);
  };

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    console.log(value, field, "onchnage");
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedData = {
      ...formData,
      invoice_i_value_usd: formatDecimal(formData.invoice_i_value_usd),
      invoice_i_value_inr: formatDecimal(formData.invoice_i_value_inr),
      invoice_fob_usd: formatDecimal(formData.invoice_fob_usd),
      invoice_fob_inr: formatDecimal(formData.invoice_fob_inr),
      invoice_exch_rate: formatDecimal(formData.invoice_exch_rate),
    };
    updateBranchMutation.mutate({ decryptedId, data: formattedData });
  };

  const isINRValueValid = (enteredValue, expectedValue) => {
    const lowerBound = expectedValue - 2;
    const upperBound = expectedValue + 2;
    return enteredValue >= lowerBound && enteredValue <= upperBound;
  };
  const usd_value = Number(formData.invoice_i_value_usd);
  const freight_value = Number(formData.invoice_freight);
  const insurance_value = Number(formData.invoice_insurance);
  const exchange_value = Number(formData?.invoice_exch_rate);
  const inr_value = Number(formData.invoice_i_value_inr);

  const expectedINRValue = usd_value * exchange_value;

  const isINRValid = isINRValueValid(inr_value, expectedINRValue);

  // auto calculation for fobusd and fobinr

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      invoice_fob_usd: (usd_value - (freight_value + insurance_value)).toFixed(
        2
      ),
      invoice_fob_inr: (
        (usd_value - (freight_value + insurance_value)) *
        exchange_value
      ).toFixed(2),
    }));
  }, [usd_value, freight_value, insurance_value, exchange_value]);

  if (isLoading) {
    return <LoaderComponent name="Document Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Document  Data"
        refetch={refetch}
      />
    );
  }
  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-0 lg:p-4">
        <DocumentHeader documentDetails={documentDetails} />

        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            {/* Branch Details Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  BL No
                </label>
                <Input
                  className="bg-white"
                  value={formData.invoice_bl_no}
                  onChange={(e) => handleInputChange(e, "invoice_bl_no")}
                  placeholder="Enter  BL no"
                />
              </div>
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Bl Date
                </label>
                <Input
                  type="date"
                  className="bg-white"
                  value={formData.invoice_bl_date}
                  onChange={(e) => handleInputChange(e, "invoice_bl_date")}
                  placeholder="Enter  Bl Date"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Shipping Bill No
                </label>
                <Input
                  className="bg-white"
                  value={formData.invoice_sb_no}
                  onChange={(e) => handleInputChange(e, "invoice_sb_no")}
                  placeholder="Enter  Sb No"
                />
              </div>
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Shipping Bill Date
                </label>
                <Input
                  type="date"
                  className="bg-white"
                  value={formData.invoice_sb_date}
                  onChange={(e) => handleInputChange(e, "invoice_sb_date")}
                  placeholder="Enter  Sb Date"
                />
              </div>

              <div className="col-span-1 lg:col-span-2">
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Container
                </label>
                <Input
                  className="bg-white"
                  value={formData.invoice_container}
                  onChange={(e) => handleInputChange(e, "invoice_container")}
                  placeholder="  Container"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Voyage
                </label>
                <Input
                  className="bg-white"
                  value={formData.invoice_voyage}
                  onChange={(e) => handleInputChange(e, "invoice_voyage")}
                  placeholder="Enter  Voyage"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Vessel
                </label>

                {/* <Select
                  value={formData.invoice_vessel}
                  onValueChange={(value) =>
                    handleInputChange({ target: { value } }, "invoice_vessel")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Vessel" />
                  </SelectTrigger>
                  <SelectContent className="bg-white h-56">
                    {vesselData?.vessel.map((item, key) => (
                      <SelectItem key={key} value={item.vessel_name}>
                        {item.vessel_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}

                <MemoizedSelect
                  value={formData.invoice_vessel}
                  onChange={(value) =>
                    handleInputChange({ target: { value } }, "invoice_vessel")
                  }
                  // onValueChange={(value) =>
                  //   handleInputChange({ target: { value } }, "invoice_vessel")
                  // }
                  options={
                    vesselData?.vessel?.map((item, key) => ({
                      key: key,
                      value: item.vessel_name,
                      label: item.vessel_name,
                    })) || []
                  }
                  placeholder="Select Vessel."
                />
              </div>
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Seal
                </label>
                <Input
                  className="bg-white"
                  value={formData.invoice_seal}
                  onChange={(e) => handleInputChange(e, "invoice_seal")}
                  placeholder="Enter  Seal"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Shipper
                </label>

                <Select
                  value={formData.invoice_shipper}
                  onValueChange={(value) =>
                    handleInputChange({ target: { value } }, "invoice_shipper")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Shiper" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {shipperData?.shipper.map((item, key) => (
                      <SelectItem key={key} value={item.shipper_name}>
                        {item.shipper_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  USD Value
                </label>
                <Input
                  className="bg-white"
                  value={formData.invoice_i_value_usd}
                  onChange={(e) =>
                    handleDecimalInputChange(e, "invoice_i_value_usd")
                  }
                  placeholder="Enter  USD Value"
                />
              </div>
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2  font-medium `}
                >
                  Invoice Exchange rate
                </label>
                <Input
                  className="bg-white"
                  value={formData.invoice_exch_rate}
                  onChange={(e) =>
                    handleDecimalInputChange(e, "invoice_exch_rate")
                  }
                  placeholder="Enter Invoice Exchange rate"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Insurance
                </label>
                <Input
                  className="bg-white"
                  value={formData.invoice_insurance}
                  onChange={(e) =>
                    handleDecimalInputChange(e, "invoice_insurance")
                  }
                  placeholder="Enter Insurance"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Freight
                </label>
                <Input
                  className="bg-white"
                  value={formData.invoice_freight}
                  onChange={(e) =>
                    handleDecimalInputChange(e, "invoice_freight")
                  }
                  placeholder="Enter Freight"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 flex items-center justify-between font-medium `}
                >
                  <span>Invoice Value</span>
                  <span>{expectedINRValue}</span>
                </label>
                <Input
                  className={`bg-white ${!isINRValid ? "border-red-500" : ""}`}
                  value={formData.invoice_i_value_inr}
                  onChange={(e) =>
                    handleDecimalInputChange(e, "invoice_i_value_inr")
                  }
                  placeholder="Enter Invoice Value"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 flex items-center justify-between font-medium `}
                >
                  <span> FOB USD</span>
                  <span>{formData.invoice_fob_usd}</span>
                </label>
                <Input
                  read-only
                  className="bg-white cursor-not-allowed"
                  value={formData.invoice_fob_usd}
                  onChange={(e) =>
                    handleDecimalInputChange(e, "invoice_fob_usd")
                  }
                  placeholder="Enter FOB Value"
                />
              </div>
              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 flex items-center justify-between font-medium `}
                >
                  <span> FOB INR</span>
                  <span>{formData.invoice_fob_inr}</span>
                </label>
                <Input
                  read-only
                  className="bg-white cursor-not-allowed"
                  value={formData.invoice_fob_inr}
                  onChange={(e) =>
                    handleDecimalInputChange(e, "invoice_fob_inr")
                  }
                  placeholder="Enter FOB INR Value"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Let Export date
                </label>
                <Input
                  type="date"
                  className="bg-white"
                  value={formData.invoice_let_exports_date}
                  onChange={(e) =>
                    handleInputChange(e, "invoice_let_exports_date")
                  }
                  placeholder="Enter Let Export date"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Etd Date
                </label>
                <Input
                  type="date"
                  className="bg-white"
                  value={formData.invoice_etd_date}
                  onChange={(e) => handleInputChange(e, "invoice_etd_date")}
                  placeholder="Enter  Etd Date"
                />
              </div>

              <div>
                <label
                  className={`block  ${ButtonConfig.cardLabel} text-sm mb-2 font-medium `}
                >
                  Eta Date
                </label>
                <Input
                  type="date"
                  className="bg-white"
                  value={formData.invoice_eta_date}
                  onChange={(e) => handleInputChange(e, "invoice_eta_date")}
                  placeholder="Enter  Eta Date"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col items-end">
          {updateBranchMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={updateBranchMutation.isPending}
          >
            {updateBranchMutation.isPending ? "Updating..." : "Update Document"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default InvoiceDocumentEdit;
