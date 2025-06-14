import { useToast } from "@/hooks/use-toast";
import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Edit, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const EditCustomer = ({ customerId }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customer_short: "",
    customer_name: "",
    customer_country: "",
    customer_status: "Active",
  });

  const fetchCustomerData = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-customer-by-id/${customerId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const customerData = response.data.customer;
      setFormData({
        customer_short: customerData.customer_short,
        customer_name: customerData.customer_name,
        customer_country: customerData.customer_country,
        customer_status: customerData.customer_status,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch customer data",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCustomerData();
    }
  }, [open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      customer_status: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.customer_short ||
      !formData.customer_name ||
      !formData.customer_country ||
      !formData.customer_status
    ) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${BASE_URL}/api/panel-update-customer/${customerId}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast({
        title: "Success",
        description: "Customer updated successfully",
      });

      await queryClient.invalidateQueries(["customers"]);
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update Customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger> */}
      <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className={`transition-all duration-200 ${isHovered ? 'bg-blue-50' : ''}`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <Edit className={`h-4 w-4 transition-all duration-200 ${isHovered ? 'text-blue-500' : ''}`} />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit Customer</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Customer</DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                placeholder="Enter Customer name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer_short">Short Name</Label>
              <Input
                id="customer_short"
                name="customer_short"
                value={formData.customer_short}
                onChange={handleInputChange}
                placeholder="Enter Short name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="customer_country">Country</Label>
              <Input
                id="customer_country"
                name="customer_country"
                value={formData.customer_country}
                onChange={handleInputChange}
                placeholder="Enter Country"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer_status">Status</Label>
              <Select
                value={formData.customer_status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading || isFetching} className="bg-yellow-500 text-black hover:bg-yellow-100">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Customer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditCustomer;
