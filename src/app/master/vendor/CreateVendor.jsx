import Page from "@/app/dashboard/page";
import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import { ButtonConfig } from "@/config/ButtonConfig";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFetchProduct, useFetchState } from "@/hooks/useApi";
import BASE_URL from "@/config/BaseUrl";

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

const BranchHeader = ({ progress }) => {
  return (
    <div
      className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 ${ButtonConfig.cardheaderColor} p-4 shadow-sm`}
    >
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-800">Create Vendor</h1>
        <p className="text-gray-600 mt-2">
          Add a new vendor to your organization
        </p>
      </div>

      <div className="flex-1 pt-2">
        <div className="sticky top-4">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Basic Details</span>
            <span className="text-sm font-medium">Additional Details</span>
          </div>

          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-yellow-500 h-full rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-yellow-600">
              {progress}% Complete
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const createBranch = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch("https://agsdemo.in/pspapi/public/api/vendors", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to create vendor");
  return response.json();
};

const CreateVendor = () => {
  const { toast } = useToast();
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
    vendor_type: "2", // Default to Customer (2)
  });
  const [progress, setProgress] = useState(0);

  const { data: stateData } = useFetchState();
  
  const createBranchMutation = useMutation({
    mutationFn: createBranch,

    onSuccess: (response) => {
      if (response.code == 200) {
        toast({
          title: "Success",
          description: response.msg || "Vendor created successfully",
        });
        navigate("/master/vendor");
      } else {
        toast({
          title: "Error",
          description: response.msg || "Failed to create vendor",
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
      createBranchMutation.mutate(validatedData);
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

  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-4">
        <BranchHeader progress={progress} />
        <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-1 row-span-2">
                <label className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}>
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
                <label className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}>
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
                <label className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}>
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
                <label className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}>
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
                <label className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}>
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
                <label className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}>
                  Contact Mobile <span className="text-red-500">*</span>
                </label>
                <Input
                  className="bg-white"
                  value={formData.vendor_contact_mobile}
                  onChange={(e) => handleInputChange(e, "vendor_contact_mobile")}
                  placeholder="Enter mobile number"
                />
              </div>

              <div>
                <label className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}>
                  State <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.vendor_state_name}
                  onValueChange={(value) => {
                    handleInputChange({ target: { value } }, "vendor_state_name");
                    // You might want to set state code here based on selected state
                  }}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {stateData?.state?.map((item) => (
                      <SelectItem value={item.state_name} key={item.state_name}>
                        {item.state_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}>
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
                <label className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}>
                  Vendor Type <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.vendor_type}
                  onValueChange={(value) => 
                    handleInputChange({ target: { value } }, "vendor_type")
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="1">Vendor</SelectItem>
                    <SelectItem value="2">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-end">
          {createBranchMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} flex items-center mt-2`}
            disabled={createBranchMutation.isPending}
          >
            {createBranchMutation.isPending ? "Submitting..." : "Create Vendor"}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default CreateVendor;