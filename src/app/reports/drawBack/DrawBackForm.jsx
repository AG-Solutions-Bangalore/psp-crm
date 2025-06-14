import Page from "@/app/dashboard/page";
import {
  DutyDrawBackDownload,
  DutyDrawBackView
} from "@/components/buttonIndex/ButtonComponents";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import BASE_URL from "@/config/BaseUrl";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Download } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// Form validation schema
const drawBackFormSchema = z.object({
  from_date: z.string().min(1, "From date is required"),
  to_date: z.string().min(1, "To Date is required"),
  branch_name: z.string().optional(),
});

// API function for creating contract
const createContract = async (data) => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}/api/panel-fetch-drawback-report `, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message || "Failed to create duty drawback account"
    );
  }
  return response.json();
};

// Header component
const BranchHeader = () => (
  <div
    className={`flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between ${ButtonConfig.cardheaderColor} items-start gap-8 mb-2 p-4 shadow-sm`}
  >
    <div className="flex-1">
      <h1 className="text-3xl font-bold text-gray-800">
        Duty Drawback Summary
      </h1>
      <p className="text-gray-600 mt-2">Add a Duty Drawback to Visit Report</p>
    </div>
  </div>
);

const DrawBackForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    from_date: moment().startOf("month").format("YYYY-MM-DD"),
    to_date: moment().format("YYYY-MM-DD"),
    branch_name: "",
  });

  // Fetch branches query
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

  const createDrawBackMutation = useMutation({
    mutationFn: createContract,

    onSuccess: (data) => {
      navigate("/report/duty-drawback/view", {
        state: {
          reportData: data,
          formData: formData,
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

  // Handle form input changes
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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validatedData = drawBackFormSchema.parse(formData);
      createDrawBackMutation.mutate(validatedData);
    } catch (error) {
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
        return;
      }

      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle download
  const handleDownload = async (e) => {
    e.preventDefault();

    try {
      const response = await axios({
        url: `${BASE_URL}/api/panel-download-drawback-report`,
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
      link.setAttribute("download", "dutydrawback_account.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Dutydrawback Account downloaded successfully",
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
            <form onSubmit={handleSubmit}>
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
                        <SelectItem
                          key={`${branch.branch_name}-${index}`} // Adding index ensures uniqueness
                          value={branch.branch_name}
                        >
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-row items-end mt-3 justify-end w-full">
                <DutyDrawBackDownload
                  type="button"
                  className={`ml-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </DutyDrawBackDownload>
                <DutyDrawBackView
                  type="submit"
                  className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} ml-2 flex items-center`}
                  disabled={createDrawBackMutation.isPending}
                >
                  {createDrawBackMutation.isPending
                    ? "Submitting..."
                    : "Submit DutyDrawBack"}
                </DutyDrawBackView>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </Page>
  );
};

export default DrawBackForm;
