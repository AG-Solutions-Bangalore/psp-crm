import { useToast } from "@/hooks/use-toast";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import axios from "axios";
import BASE_URL from "@/config/BaseUrl";
import { Loader2, SquarePlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
const CreateCustomer = () => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customer_short: "",
    customer_name: "",
    customer_country: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.customer_short ||
      !formData.customer_name ||
      !formData.customer_country
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
      await axios.post(`${BASE_URL}/api/panel-create-customer`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Success",
        description: "Customer created successfully",
      });

      setFormData({
        name_of_firm: "",
        brand_name: "",
        rep1_name: "",
        rep1_mobile: "",
      });
      await queryClient.invalidateQueries(["customers"]);

      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create Customer",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* <Button variant="default" className="ml-2 bg-yellow-500 text-black hover:bg-yellow-100">
        <SquarePlus className="h-4 w-4" /> Customer
      </Button> */}

        {pathname === "/customers" ? (
          <Button
            variant="default"
            className="ml-2 bg-yellow-500 text-black hover:bg-yellow-100"
          >
            <SquarePlus className="h-4 w-4" /> Customer
          </Button>
        ) : pathname === "/create-enquiries" ? (
          <p className="text-xs text-yellow-700 ml-2 mt-1 w-32 hover:text-red-800 cursor-pointer">
            Create Customer
          </p>
        ) : null}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
        </DialogHeader>

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
              placeholder="Enter Country "
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-yellow-500 text-black hover:bg-yellow-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Customer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomer;
