import { VENDOR_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/dashboard/page";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useFetchState } from "@/hooks/useApi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import ReactSelect, { components } from "react-select";
import { ChevronsUpDown } from "lucide-react";
const DropdownIndicator = () => (
  <div className="p-2 flex items-center ">
    <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
  </div>
);
const vendortype = [
  {
    value: "1",
    label: "Vendor",
  },
  {
    value: "2",
    label: "Customer",
  },
];
const vendorFormSchema = z.object({
  vendor_name: z.string().min(1, "Vendor name is required"),
  vendor_email: z.string().email("Invalid email format"),
  vendor_address: z.string().min(1, "Address is required"),
  vendor_gst: z.any().optional(),
  vendor_contact_name: z.string().min(1, "Contact name is required"),
  vendor_contact_mobile: z.string().min(10, "Mobile should be 10 digits"),
  vendor_state_name: z.string().min(1, "State is required"),
  vendor_state_code: z.string().min(1, "State code is required"),
  vendor_type: z.string().min(1, "Vendor type is required"),
  status: z.string().min(1, "Status is required"),
});

// Header Component
const VendorHeader = ({ vendorDetails }) => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">
            {vendorDetails?.vendor_name || "Vendor Details"}
          </h1>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {vendorDetails?.status || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-600 mt-2">Update vendor details</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="font-medium">
            State: {vendorDetails?.vendor_state_name || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="font-medium">
            GST: {vendorDetails?.vendor_gst || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

const updateVendor = async (data, id, token) => {
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await apiClient.put(`${VENDOR_LIST}/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to update vendor");
  }
};
const VendorEdit = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const token = usetoken();

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vendor_name: "",
    vendor_email: "",
    vendor_address: "",
    vendor_gst: "",
    vendor_contact_name: "",
    vendor_contact_mobile: "",
    vendor_state_name: "",
    vendor_state_code: "",
    vendor_type: "1",
    status: "Active",
  });

  const {
    data: vendorDetails,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["vendor", id],
    queryFn: async () => {
      const response = await apiClient.get(`${VENDOR_LIST}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
  });

  const { data: stateData } = useFetchState();

  useEffect(() => {
    if (vendorDetails?.data) {
      setFormData({
        vendor_name: vendorDetails.data.vendor_name,
        vendor_email: vendorDetails.data.vendor_email,
        vendor_address: vendorDetails.data.vendor_address,
        vendor_gst: vendorDetails.data.vendor_gst,
        vendor_contact_name: vendorDetails.data.vendor_contact_name || "",
        vendor_contact_mobile: vendorDetails.data.vendor_contact_mobile || "",
        vendor_state_name: vendorDetails.data.vendor_state_name,
        vendor_state_code: vendorDetails.data.vendor_state_code,
        vendor_type: vendorDetails.data.vendor_type || "1",
        status: vendorDetails.data.status || "active",
      });
    }
  }, [vendorDetails]);

  // Update vendor mutation
  const updateVendorMutation = useMutation({
    mutationFn: ({ data, id, token }) => updateVendor(data, id, token),

    onSuccess: (response) => {
      if (response.code == 201) {
        toast({
          title: "Success",
          description: response.msg || "Vendor updated successfully",
        });
        navigate("/master/vendor");
      } else {
        toast({
          title: "Error",
          description: response.msg || "Failed to update vendor",
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

  const handleInputChange = (e, field) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStateChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      vendor_state_name: value,
      // You might want to set state code here based on selected state
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const validatedData = vendorFormSchema.parse(formData);
      updateVendorMutation.mutate({ data: validatedData, id, token });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => {
          const field = err.path.join(".");
          return ` ${err.message}`;
        });

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

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Vendor Data
          </Button>
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <Card className="w-full max-w-md mx-auto mt-10">
          <CardContent>
            <div className="text-destructive text-center">
              Error Fetching Vendor Data
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="mt-4"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </Page>
    );
  }

  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-4">
        <VendorHeader vendorDetails={vendorDetails?.data} />

        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1 row-span-2">
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                >
                  Vendor Address <span className="text-red-500">*</span>
                </label>
                <Textarea
                  className="bg-white"
                  value={formData.vendor_address}
                  onChange={(e) => handleInputChange(e, "vendor_address")}
                  placeholder="Enter vendor address"
                  rows={5}
                />
              </div>

              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                >
                  Vendor Name <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.vendor_name}
                  onChange={(e) => handleInputChange(e, "vendor_name")}
                  placeholder="Enter vendor name"
                />
              </div>

              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  type="email"
                  value={formData.vendor_email}
                  onChange={(e) => handleInputChange(e, "vendor_email")}
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                >
                  GST No
                </label>
                <Input
                  className="bg-white"
                  value={formData.vendor_gst}
                  onChange={(e) => handleInputChange(e, "vendor_gst")}
                  placeholder="Enter GST number"
                />
              </div>

              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                >
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.vendor_contact_name}
                  onChange={(e) => handleInputChange(e, "vendor_contact_name")}
                  placeholder="Enter contact name"
                />
              </div>

              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                >
                  Contact Mobile <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.vendor_contact_mobile}
                  onChange={(e) =>
                    handleInputChange(e, "vendor_contact_mobile")
                  }
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                >
                  State <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.vendor_state_name}
                  onValueChange={handleStateChange}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {stateData?.data?.map((item) => (
                      <SelectItem value={item.state_name} key={item.state_name}>
                        {item.state_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                >
                  State Code <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.vendor_state_code}
                  onChange={(e) => handleInputChange(e, "vendor_state_code")}
                  placeholder="Enter state code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Vendor Type<span className="text-red-500">*</span>
                </label>

                <ReactSelect
                  isMulti
                  closeMenuOnSelect={false}
                  options={vendortype}
                  value={
                    typeof formData.vendor_type === "string"
                      ? vendortype.filter((opt) =>
                          formData.vendor_type.split(",").includes(opt.value)
                        )
                      : []
                  }
                  onChange={(selectedOptions) =>
                    setFormData((prev) => ({
                      ...prev,
                      vendor_type: selectedOptions
                        .map((opt) => opt.value)
                        .join(","),
                    }))
                  }
                  className="basic-multi-select text-sm ring-offset-background placeholder:text-muted-foreground"
                  classNamePrefix="select"
                  placeholder="Select Vendor..."
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderRadius: "0.7rem",
                      borderWidth: "0.1px",
                      cursor: "pointer",
                      borderColor: state.isFocused
                        ? "#1f7a57"
                        : base.borderColor,
                      boxShadow: state.isFocused
                        ? "0 0 0 0.1px #1f7a57"
                        : "none",
                      fontSize: "0.875rem",
                      "&:hover": {
                        borderColor: "#1f7a57",
                      },
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isFocused ? "#1f7a57" : "white",
                      borderRadius: "0.7rem",
                      color: state.isFocused ? "white" : "#111827",
                      "&:active": {
                        backgroundColor: "#1f7a57",
                        color: "white",
                      },
                    }),
                    multiValueRemove: (base, state) => ({
                      ...base,
                      color: state.isFocused ? "#1f7a57" : "#6b7280",
                      backgroundColor: state.isFocused
                        ? "#d1fae5"
                        : "transparent",
                      borderRadius: "0.375rem",
                      cursor: "pointer",
                      ":hover": {
                        color: "white",
                        backgroundColor: "#1f7a57",
                      },
                    }),
                  }}
                  components={{ DropdownIndicator }}
                />
              </div>
              <div>
                <label
                  className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                >
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleInputChange({ target: { value } }, "status")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col items-end">
          {updateVendorMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={updateVendorMutation.isPending}
          >
            {updateVendorMutation.isPending ? "Updating..." : "Update Vendor"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default VendorEdit;
