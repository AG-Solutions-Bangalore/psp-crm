import React, { useEffect } from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, Edit, AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ProductEdit } from "@/components/buttonIndex/ButtonComponents";

const EditProduct = ({ productId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    product_name: "",
    product_status: "Active",
  });
  const [originalData, setOriginalData] = useState(null);

  const fetchProductData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-product-by-id/${productId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const productData = response.data.product;
      setFormData({
        product_name: productData.product_name,
        product_status: productData.product_status,
      });
      setOriginalData({
        product_name: productData.product_name,
        product_status: productData.product_status,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch product data",
        variant: "destructive",
      });
      setOpen(false);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open || editMode) {
      fetchProductData();
    }
  }, [open, editMode]);

  const handleSubmit = async () => {
    if (!formData.product_name.trim()) {
      toast({
        title: "Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/panel-update-product/${productId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Product updated successfully",
      });

      await queryClient.invalidateQueries(["products"]);
      setOpen(false);
      setEditMode(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const hasChanges =
    originalData &&
    (formData.product_name !== originalData.product_name ||
      formData.product_status !== originalData.product_status);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              {/* <Button 
              variant="ghost" 
              size="icon"
              className={`transition-all duration-200 ${isHovered ? 'bg-blue-50' : ''}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Edit className={`h-4 w-4 transition-all duration-200 ${isHovered ? 'text-blue-500' : ''}`} />
            </Button> */}
              <div>
                <ProductEdit
                  className={`transition-all duration-200 ${
                    isHovered ? "bg-blue-50" : ""
                  }`}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                ></ProductEdit>
              </div>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Product</p>
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
              <h4 className="font-medium leading-none">Edit Product</h4>
              <p className="text-sm text-muted-foreground">
                Update product details
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-1">
                <label htmlFor="product_name" className="text-sm font-medium">
                  Product Name
                </label>
                <div className="relative">
                  <Input
                    id="product_name"
                    placeholder="Enter product name"
                    value={formData.product_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        product_name: e.target.value,
                      }))
                    }
                    className={hasChanges ? "pr-8 border-blue-200" : ""}
                  />
                  {hasChanges &&
                    formData.product_name !== originalData.product_name && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <RefreshCcw
                          className="h-4 w-4 text-blue-500 cursor-pointer hover:rotate-180 transition-all duration-300"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              product_name: originalData.product_name,
                            }))
                          }
                        />
                      </div>
                    )}
                </div>
              </div>
              <div className="grid gap-1">
                <label htmlFor="product_status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={formData.product_status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, product_status: value }))
                  }
                >
                  <SelectTrigger
                    className={hasChanges ? "border-blue-200" : ""}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="Inactive">
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
                    ? "bg-yellow-500 text-black hover:bg-yellow-100"
                    : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Product"
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

export default EditProduct;
