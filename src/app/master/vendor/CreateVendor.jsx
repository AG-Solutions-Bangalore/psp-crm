import { VENDOR_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/page/page";
import PageHeaders from "@/components/common/PageHeaders";
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
import { useMutation } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactSelect from "react-select";
import { z } from "zod";
const DropdownIndicator = () => (
  <div className="p-2 flex items-center ">
    <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400" />
  </div>
);
// Validation Schema
const branchFormSchema = z.object({
  vendor_name: z.string().min(1, "Name is required"),
  vendor_email: z.string().email("Invalid email format"),
  vendor_address: z.string().min(1, "Address is required"),
  vendor_gst: z.string().optional(),
  vendor_contact_name: z.string().min(1, "Contact name is required"),
  vendor_contact_mobile: z.string().min(10, "Mobile should be 10 digits"),
  vendor_state_name: z.string().min(1, "State is required"),
  vendor_state_code: z.string().min(1, "State code is required"),
  vendor_type: z.string().min(1, "Vendor type is required"),
});

const createBranch = async (data, token) => {
  if (!token) throw new Error("No authentication token found");

  try {
    const response = await apiClient.post(`${VENDOR_LIST}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Failed to create vendor");
  }
};
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
const CreateVendor = () => {
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
    vendor_type: "",
  });
  const [progress, setProgress] = useState(0);

  const { data: stateData } = useFetchState();
  const createBranchMutation = useMutation({
    mutationFn: ({ data, token }) => createBranch(data, token),
    onSuccess: (response) => {
      console.log(response);
      if (response.code == 201) {
        toast({
          title: "Success",
          description: response.message || "Vendor created successfully",
        });
        navigate("/master/vendor");
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create vendor",
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

    if (field === "vendor_state_name") {
      const matchedState = stateData.data.find(
        (state) => state.state_name === value
      );

      setFormData((prev) => ({
        ...prev,
        [field]: value,
        vendor_state_code: matchedState ? matchedState.state_code : "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  useEffect(() => {
    const calculateProgress = () => {
      const totalFields = Object.keys(formData).length;
      const filledFields = Object.values(formData).filter(
        (value) => value.toString().trim() !== ""
      ).length;
      const percentage = Math.round((filledFields / totalFields) * 100);
      setProgress(percentage);
    };

    calculateProgress();
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const validatedData = branchFormSchema.parse(formData);
      createBranchMutation.mutate({ data: validatedData, token });
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
  console.log(formData.vendor_roles);
  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-0">
        <PageHeaders
          title={"Create Vendor"}
          subtitle="vendor"
          progress={progress}
        />
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
                  onValueChange={(value) => {
                    handleInputChange(
                      { target: { value } },
                      "vendor_state_name"
                    );
                  }}
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
                  // onChange={(e) => handleInputChange(e, "vendor_state_code")}
                  placeholder="Enter state code"
                  disabled
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
                    Array.isArray(formData.vendor_type)
                      ? vendortype.filter((opt) =>
                          formData.vendor_type.includes(opt.value)
                        )
                      : typeof formData.vendor_type === "string"
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
                      textTransform: "uppercase",
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
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          {createBranchMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={createBranchMutation.isPending}
          >
            {createBranchMutation.isPending ? "Submitting..." : "Create Vendor"}
          </Button>

          <Button
            type="button"
            onClick={() => {
              navigate(-1);
            }}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
          >
            Go Back
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreateVendor;
