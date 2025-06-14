import Page from "@/app/dashboard/page";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BASE_URL from "@/config/BaseUrl";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download } from "lucide-react";
import axios from "axios";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useState } from "react";
import { useFetchVendor } from "@/hooks/useApi";
import {
  PurchaseSummaryCompanyView,
  PurchaseSummaryDownload,
  PurchaseSummaryVendorView,
} from "@/components/buttonIndex/ButtonComponents";

const monthwisePurchaseFormSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To Date is required"),
  branch_name: z.string().optional(),
  purchase_product_seller: z.string().optional(),
});

const createReport = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(
    `${BASE_URL}/api/panel-fetch-purchase-product-monthwise-report`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to create monthwise purchase report"
    );
  }
  return response.json();
};

const BranchHeader = () => (
  <div
    className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between ${ButtonConfig.cardheaderColor} items-start gap-8 mb-2 p-4 shadow-sm`}
  >
    <div className="flex-1">
      <h1 className="text-3xl font-bold text-gray-800">Purchase Summary</h1>
      <p className="text-gray-600 mt-2">Add a purchase data to Visit Report</p>
    </div>
  </div>
);

const MonthwisePurchaseForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    branch_name: "",
    purchase_product_seller: "",
  });

  const { data: branchData, isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branch"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${BASE_URL}/api/panel-fetch-branches`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch branch data");
      return response.json();
    },
  });

  const { data: vendorData } = useFetchVendor();

  // Separate mutations for branch and seller reports
  const branchReportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: (data) => {
      navigate("/report/monthwise-purchase-report", {
        state: {
          reportMoPurData: data,
          formFields: {
            from_date: formData.from_date,
            to_date: formData.to_date,
            branch_name: formData.branch_name,
            purchase_product_seller: formData.purchase_product_seller,
          },
        },
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sellerReportMutation = useMutation({
    mutationFn: createReport,
    onSuccess: (data) => {
      navigate("/report/monthwise-purchase-seller-report", {
        state: {
          reportMoPurData: data,
          formFields: {
            from_date: formData.from_date,
            to_date: formData.to_date,
            branch_name: formData.branch_name,
            purchase_product_seller: formData.purchase_product_seller,
          },
        },
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field, valueOrEvent) => {
    const value =
      typeof valueOrEvent === "object" && valueOrEvent.target
        ? valueOrEvent.target.value
        : valueOrEvent;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBranchReport = async (e) => {
    e.preventDefault();
    try {
      const validatedData = monthwisePurchaseFormSchema.parse(formData);
      branchReportMutation.mutate(validatedData);
    } catch (error) {
      handleValidationError(error);
    }
  };

  const handleSellerReport = async (e) => {
    e.preventDefault();
    try {
      const validatedData = monthwisePurchaseFormSchema.parse(formData);
      sellerReportMutation.mutate(validatedData);
    } catch (error) {
      handleValidationError(error);
    }
  };

  const handleValidationError = (error) => {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );

      toast({
        title: "Validation Error",
        description: (
          <ul className="list-disc pl-5">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();

    try {
      const response = await axios({
        url: `${BASE_URL}/api/panel-download-purchase-product-monthwise-report`,
        method: "POST",
        data: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "monthwise_purchase.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Monthwise Purchase downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to download report",
        variant: "destructive",
      });
    }
  };

  return (
    <Page>
      <BranchHeader />
      <Card className={`mb-6 ${ButtonConfig.cardColor}`}>
        <CardContent className="p-4">
          <div className="w-full p-4">
            <form>
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                  >
                    Enter From Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.from_date}
                    className="bg-white"
                    onChange={(e) => handleInputChange("from_date", e)}
                    placeholder="Enter From Date"
                  />
                </div>

                <div>
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                  >
                    Enter To Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    className="bg-white"
                    value={formData.to_date}
                    onChange={(e) => handleInputChange("to_date", e)}
                    placeholder="Enter To Date"
                  />
                </div>

                <div>
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                  >
                    Company
                  </label>
                  <Select
                    value={formData.branch_name}
                    onValueChange={(value) =>
                      handleInputChange("branch_name", value)
                    }
                    disabled={isBranchesLoading}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {branchData?.branch?.map((branch, index) => (
                        <SelectItem key={index} value={branch.branch_name}>
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    className={`block ${ButtonConfig.cardLabel} text-sm mb-2 font-medium`}
                  >
                    Seller
                  </label>
                  <Select
                    value={formData.purchase_product_seller}
                    onValueChange={(value) =>
                      handleInputChange("purchase_product_seller", value)
                    }
                    disabled={isBranchesLoading}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select Seller" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {vendorData?.vendor?.map((vendor, index) => (
                        <SelectItem key={index} value={vendor.vendor_name}>
                          {vendor.vendor_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-row items-end mt-3 justify-end w-full">
                <PurchaseSummaryDownload
                  type="button"
                  className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                  onClick={handleDownload}
                ></PurchaseSummaryDownload>

                <PurchaseSummaryVendorView
                  type="button"
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} ml-2 flex items-center`}
                  onClick={handleSellerReport}
                  disabled={sellerReportMutation.isPending}
                >
                  {sellerReportMutation.isPending
                    ? "Generating..."
                    : "Vendor Wise"}
                </PurchaseSummaryVendorView>

                <PurchaseSummaryCompanyView
                  type="button"
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} ml-2 flex items-center`}
                  onClick={handleBranchReport}
                  disabled={branchReportMutation.isPending}
                >
                  {branchReportMutation.isPending
                    ? "Generating..."
                    : "Company Wise"}
                </PurchaseSummaryCompanyView>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};

export default MonthwisePurchaseForm;
