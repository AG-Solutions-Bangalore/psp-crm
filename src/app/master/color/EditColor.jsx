import { COLOR_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Edit, Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

const EditColor = ({ customdescriptionId }) => {
  const token = usetoken();

  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customdescription: "",
    status: "active",
  });
  const [originalData, setOriginalData] = useState(null);

  // Fetch state data
  const fetchStateData = async () => {
    setIsFetching(true);
    try {
      const response = await apiClient.get(
        `${COLOR_LIST}/${customdescriptionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const customDescriptionData = response?.data?.data;
      setFormData({
        color: customDescriptionData.color || "",
        status: customDescriptionData.status || "active",
      });
      setOriginalData({
        color: customDescriptionData.color || "",
        status: customDescriptionData.status || "active",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch custom description data",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchStateData();
    }
  }, [open]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.color.trim()) {
      toast({
        title: "Error",
        description: "Custom Description is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.put(
        `${COLOR_LIST}/${customdescriptionId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response?.data.code == 201) {
        toast({
          title: "Success",
          description: response.data.message,
        });

        await queryClient.invalidateQueries(["color"]);
        setOpen(false);
      } else {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to update custom description",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if there are changes
  const hasChanges =
    originalData &&
    (formData.color !== originalData.color ||
      formData.status !== originalData.status);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`transition-all duration-200 ${
                  isHovered ? "bg-blue-50" : ""
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <Edit
                  className={`h-4 w-4 transition-all duration-200 ${
                    isHovered ? "text-blue-500" : ""
                  }`}
                />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Color</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-80">
        {isFetching ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Edit color</h4>
              <p className="text-sm text-muted-foreground">
                Update color details
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <label
                  htmlFor="descriptionofGoods"
                  className="text-sm font-medium"
                >
                  Color
                </label>
                <div className="relative">
                  <Input
                    id="color"
                    placeholder="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className={hasChanges ? "pr-8 border-blue-200" : ""}
                    maxLength={50}
                  />
                  {hasChanges && formData.color !== originalData.color && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <RefreshCcw
                        className="h-4 w-4 text-blue-500 cursor-pointer hover:rotate-180 transition-all duration-300"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            color: originalData.color,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-1">
                <label
                  htmlFor="descriptionofGoods_status"
                  className="text-sm font-medium"
                >
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value,
                    }))
                  }
                >
                  <SelectTrigger
                    className={hasChanges ? "border-blue-200" : ""}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasChanges && (
                <Alert className="bg-blue-50 border-blue-200 mt-2">
                  <AlertCircle className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-600 text-sm">
                    You have unsaved changes
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleSubmit}
                disabled={isLoading || !hasChanges}
                className={`mt-2 relative overflow-hidden ${
                  hasChanges
                    ? `${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} `
                    : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Color"
                )}
                {hasChanges && !isLoading && (
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                )}
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default EditColor;
