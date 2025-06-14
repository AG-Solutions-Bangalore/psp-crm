import React, { useEffect, useState,useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Settings2,
  Loader2,
  Building2,
  FileText,
  Globe,
  Calendar,
  Clock,
  Package,
  TestTubes,
  Truck,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import Page from "../dashboard/page";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";
import { ProgressBar } from "@/components/spinner/ProgressBar";
import { gsap } from "gsap";
// Header Component (same as EnquiryEdit)

const EnquiryHeader = ({ enquiryDetails }) => {
  return (
    <div className="flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 bg-white p-4 shadow-sm">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-800">Reply to Enquiry</h1>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {enquiryDetails?.enquiry?.enquiry_status || "N/A"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-600 mt-2">Update enquiry reply details</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-end gap-2 text-sm">
          <Building2 className="h-4 w-4 text-yellow-500" />
          <span>{enquiryDetails?.company?.company_name || "N/A"}</span>
        </div>
        <div className="flex items-center justify-end gap-2 text-sm">
          <FileText className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">
            Ref: {enquiryDetails?.enquiry?.enquiry_ref || "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 text-sm">
          <Globe className="h-4 w-4 text-yellow-500" />
          <span className="font-medium">
            Country: {enquiryDetails?.customer?.customer_country || "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

const EnquiryReplyEdit = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Form state for reply-specific fields
  const [replyData, setReplyData] = useState({
    production_date: "",
    completion_date: "",
    uct_sample_bangalore: "",
    received: "No",
    ple_dispatch_customer: "",
    delivered: "No",
    customer_feedback: "",
    special_instruction: "",
    cargo_dispatch: "",
    stuffing_date: "",
    f_product_sample_blr: "",
    received_blr: "No",
    f_product_sample_sb: "",
    report_dt: "",
    shipment_etd: "",
    shipment_eta: "",
    enquiry_status: "",
  });

  // Fetch Enquiry Data
  const {
    data: enquiryDetails,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["enquiry", id],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://adityaspice.com/app/public/api/panel-fetch-enquiry-by-id/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch enquiry");
      return response.json();
    },
  });

  // Update Enquiry Mutation
  const updateEnquiryMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://adityaspice.com/app/public/api/panel-update-enquiry/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error("Failed to update enquiry");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Enquiry reply updated successfully",
      });
      navigate("/enquiries");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const optionalHeaders = [
    { key: "enquirySub_product_code", label: "Product Code" },
    { key: "enquirySub_stem_type", label: "Stem Type" },
    { key: "enquirySub_moist_value", label: "Moisture Value" },
    { key: "enquirySub_final_price", label: "Final Price" },
    { key: "enquirySub_p2b_blend", label: "P2B Blend" },
  ];

  useEffect(() => {
    if (enquiryDetails) {
      // Populate reply fields from enquiry data
      setReplyData({
        production_date: enquiryDetails.enquiry.production_date || "",
        completion_date: enquiryDetails.enquiry.completion_date || "",
        uct_sample_bangalore: enquiryDetails.enquiry.uct_sample_bangalore || "",
        received: enquiryDetails.enquiry.received || "No",
        ple_dispatch_customer:
          enquiryDetails.enquiry.ple_dispatch_customer || "",
        delivered: enquiryDetails.enquiry.delivered || "No",
        customer_feedback: enquiryDetails.enquiry.customer_feedback || "",
        special_instruction: enquiryDetails.enquiry.special_instruction || "",
        cargo_dispatch: enquiryDetails.enquiry.cargo_dispatch || "",
        stuffing_date: enquiryDetails.enquiry.stuffing_date || "",
        f_product_sample_blr: enquiryDetails.enquiry.f_product_sample_blr || "",
        received_blr: enquiryDetails.enquiry.received_blr || "No",
        f_product_sample_sb: enquiryDetails.enquiry.f_product_sample_sb || "",
        report_dt: enquiryDetails.enquiry.report_dt || "",
        shipment_etd: enquiryDetails.enquiry.shipment_etd || "",
        shipment_eta: enquiryDetails.enquiry.shipment_eta || "",
        enquiry_status: enquiryDetails.enquiry.enquiry_status || "",
      });
    }
  }, [enquiryDetails]);

  const handleInputChange = (e, field) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setReplyData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const RadioOption = ({ label, value, onChange, currentValue }) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <RadioGroup
        value={currentValue}
        onValueChange={(newValue) =>
          onChange({ target: { value: newValue } }, value)
        }
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2 cursor-pointer">
          <RadioGroupItem value="Yes" id={`${value}-yes`} />
          <label htmlFor={`${value}-yes`} className="cursor-pointer">
            Yes
          </label>
        </div>
        <div className="flex items-center space-x-2 cursor-pointer">
          <RadioGroupItem value="No" id={`${value}-no`} />
          <label htmlFor={`${value}-no`} className="cursor-pointer">
            No
          </label>
        </div>
      </RadioGroup>
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare the submission data with all required fields
    const submitData = {
      customer_id: enquiryDetails?.customer?.id,
      enquiry_date: enquiryDetails?.enquiry?.enquiry_date,
      packing_type: enquiryDetails?.enquiry?.packing_type,
      marking: enquiryDetails?.enquiry?.marking,
      shipment_date: enquiryDetails?.enquiry?.shipment_date,
      sample_required: enquiryDetails?.enquiry?.sample_required,
      production_date: replyData.production_date,
      completion_date: replyData.completion_date,
      uct_sample_bangalore: replyData.uct_sample_bangalore,
      received: replyData.received,
      ple_dispatch_customer: replyData.ple_dispatch_customer,
      delivered: replyData.delivered,
      customer_feedback: replyData.customer_feedback,
      special_instruction: replyData.special_instruction,
      treatment_required: enquiryDetails?.enquiry?.treatment_required,
      etd: enquiryDetails?.enquiry?.etd,
      gama_rediations: enquiryDetails?.enquiry?.gama_rediations,
      steam_sterlizaton: enquiryDetails?.enquiry?.steam_sterlizaton,
      cargo_dispatch: replyData.cargo_dispatch,
      stuffing_date: replyData.stuffing_date,
      f_product_sample_blr: replyData.f_product_sample_blr,
      received_blr: replyData.received_blr,
      f_product_sample_sb: replyData.f_product_sample_sb,
      report_dt: replyData.report_dt,
      shipment_etd: replyData.shipment_etd,
      shipment_eta: replyData.shipment_eta,
      enquiry_status: replyData.enquiry_status,
      // Format enquiry_data as an array of product details
      enquiry_data: enquiryDetails?.enquirySub?.map((product) => ({
        id: product.id,
        enquirySub_product_name: product.enquirySub_product_name,
        enquirySub_product_code: product.enquirySub_product_code,
        enquirySub_shu: product.enquirySub_shu,
        enquirySub_asta: product.enquirySub_asta,
        enquirySub_qlty_type: product.enquirySub_qlty_type,
        enquirySub_stem_type: product.enquirySub_stem_type,
        enquirySub_course_type: product.enquirySub_course_type,
        enquirySub_moist_value: product.enquirySub_moist_value,
        enquirySub_qnty: product.enquirySub_qnty,
        enquirySub_quoted_price: product.enquirySub_quoted_price,
        enquirySub_final_price: product.enquirySub_final_price,
        enquirySub_p2b_blend: product.enquirySub_p2b_blend,
      })),
    };

    // Remove any undefined values from the submitData object
    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === undefined) {
        delete submitData[key];
      }
    });

    // Send the data to the server
    updateEnquiryMutation.mutate(submitData);
  };

  if (isLoading) {
    return (
      <Page>
        <div className="flex justify-center items-center h-full">
          <Button disabled>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading Enquiry Data
          </Button>
        </div>
      </Page>
    );
  }

  if (isError) {
    return (
      <Page>
        <div className="p-4">
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-4">
                Error Loading Enquiry
              </h2>
              <Button onClick={() => refetch()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </Page>
    );
  }
 

  // Original enquiry details in view mode
  const CompactViewSection = ({ enquiryDetails }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const containerRef = useRef(null);
    const contentRef = useRef(null);
    const InfoItem = ({ icon: Icon, label, value }) => (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-yellow-600 shrink-0" />
        <span className="text-sm text-gray-600">{label}:</span>
        <span className="text-sm font-medium">{value || "N/A"}</span>
      </div>
    );
    const toggleView = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      
      if (isExpanded) {
        // Folding animation
        gsap.to(content, {
          height: 0,
          opacity: 0,
          duration: 0.5,
          ease: "power2.inOut",
          transformOrigin: "top",
          transformStyle: "preserve-3d",
          rotateX: -90,
          onComplete: () => setIsExpanded(false)
        });
      } else {
        // Unfolding animation
        setIsExpanded(true);
        gsap.fromTo(content,
          {
            height: 0,
            opacity: 0,
            rotateX: -90
          },
          {
            height: "auto",
            opacity: 1,
            duration: 0.5,
            ease: "power2.inOut",
            transformOrigin: "top",
            transformStyle: "preserve-3d",
            rotateX: 0
          }
        );
      }
    };

    const ProductTable = ({ products, optionalHeaders }) => (
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left border border-gray-200 font-medium text-gray-600">
                Product Name
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-gray-600">
                SHU
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-gray-600">
                ASTA
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-gray-600">
                Quality Type
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-gray-600">
                Course Type
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-gray-600">
                Quantity
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-gray-600">
                Quoted Price
              </th>
              {optionalHeaders?.map(
                (header) =>
                  products?.some((product) => product[header.key]) && (
                    <th
                      key={header.key}
                      className="p-2 text-left border border-gray-200 font-medium text-gray-600"
                    >
                      {header.label}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody className="bg-white">
            {products?.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-2 border border-gray-200">
                  {product.enquirySub_product_name}
                </td>

                <td className="p-2 border border-gray-200">
                  {product.enquirySub_shu}
                </td>
                <td className="p-2 border border-gray-200">
                  {product.enquirySub_asta}
                </td>
                <td className="p-2 border border-gray-200">
                  {product.enquirySub_qlty_type}
                </td>
                <td className="p-2 border border-gray-200">
                  {product.enquirySub_course_type}
                </td>
                <td className="p-2 border border-gray-200">
                  {product.enquirySub_qnty}
                </td>
                <td className="p-2 border border-gray-200">
                  {product.enquirySub_quoted_price}
                </td>
                {optionalHeaders?.map(
                  (header) =>
                    products?.some((p) => p[header.key]) && (
                      <td
                        key={header.key}
                        className="p-2 border border-gray-200"
                      >
                        {product[header.key]}
                      </td>
                    )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    const TreatmentInfo = () =>
      enquiryDetails?.enquiry?.treatment_required === "Yes" && (
        <div className="mt-2 p-2 bg-yellow-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <InfoItem
              icon={Clock}
              label="ETD"
              value={enquiryDetails.enquiry.etd}
            />
            <InfoItem
              icon={TestTubes}
              label="Gama Radiations"
              value={enquiryDetails.enquiry.gama_rediations}
            />
            <InfoItem
              icon={TestTubes}
              label="Steam Sterilization"
              value={enquiryDetails.enquiry.steam_sterlizaton}
            />
          </div>
        </div>
      );

    return (
      <Card className="mb-6 overflow-hidden" ref={containerRef}>
         <div className="p-4 bg-yellow-50 cursor-pointer flex items-center justify-between" onClick={toggleView}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Original Enquiry Details
          </h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              {enquiryDetails?.enquiry?.enquiry_status}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-yellow-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-yellow-600" />
            )}
          </div>
        </div>
        <div 
          ref={contentRef}
          className="transform-gpu"
          style={{ transformStyle: 'preserve-3d' }}
        >
        <CardContent className="p-4">
        

          <div className="grid grid-cols-3 gap-6 mb-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <InfoItem
                icon={FileText}
                label="Customer"
                value={enquiryDetails?.customer?.customer_name}
              />
              <InfoItem
                icon={Clock}
                label="Enquiry Date"
                value={enquiryDetails?.enquiry?.enquiry_date}
              />
            </div>
            <div className="space-y-2">
              <InfoItem
                icon={FileText}
                label="Marking"
                value={enquiryDetails?.enquiry?.marking}
              />
              <InfoItem
                icon={Package}
                label="Packing Type"
                value={enquiryDetails?.enquiry?.packing_type}
              />
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <InfoItem
                icon={TestTubes}
                label="Sample Required"
                value={enquiryDetails?.enquiry?.sample_required}
              />
              <InfoItem
                icon={Truck}
                label="Treatment Required"
                value={enquiryDetails?.enquiry?.treatment_required}
              />
            </div>
          </div>

          <TreatmentInfo />

          {/* Products Table */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Products</h3>
            <ProductTable
              products={enquiryDetails?.enquirySub}
              optionalHeaders={optionalHeaders}
            />
          </div>
        </CardContent>
        </div>
      </Card>
    );
  };

  return (
    <Page>
      <form onSubmit={handleSubmit} className="w-full p-4">
        <EnquiryHeader enquiryDetails={enquiryDetails} />

        {/* View Section */}
        <CompactViewSection enquiryDetails={enquiryDetails} />
        

        {/* Reply Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Reply Details</h2>

            {/* Dates Section */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Production Date
                </label>
                <Input
                  type="date"
                  value={replyData.production_date}
                  onChange={(e) => handleInputChange(e, "production_date")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Completion Date
                </label>
                <Input
                  type="date"
                  value={replyData.completion_date}
                  onChange={(e) => handleInputChange(e, "completion_date")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select
                  value={replyData.enquiry_status}
                  onValueChange={(value) =>
                    handleInputChange({ target: { value } }, "enquiry_status")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Enquiry Received",
                      "New Enquiry",
                      "Order Cancel",
                      "Order Closed",
                      "Order Confirmed",
                      "Order Delivered",
                      "Order Progress",
                      "Order Shipped",
                      "Quotation",
                    ].map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
         

            {/* Sample Status Section */}

      
              <div>
                <label className="block text-sm font-medium mb-2">
                  UCT Sample Bangalore
                </label>
                <Input
                  type="date"
                  value={replyData.uct_sample_bangalore}
                  onChange={(e) => handleInputChange(e, "uct_sample_bangalore")}
                />
              </div>
              <RadioOption
                label="Sample Received"
                value="received"
                onChange={handleInputChange}
                currentValue={replyData.received}
              />
              <div>
                <label className="block text-sm font-medium mb-2">
                  Sample Dispatch to Customer
                </label>
                <Input
                  type="date"
                  value={replyData.ple_dispatch_customer}
                  onChange={(e) =>
                    handleInputChange(e, "ple_dispatch_customer")
                  }
                />
              </div>
              <RadioOption
                label="Delivered"
                value="delivered"
                onChange={handleInputChange}
                currentValue={replyData.delivered}
              />
              <div>
                <label className="block text-sm font-medium mb-2">
                  Customer Feedback
                </label>
                <Input
                  type="text"
                  value={replyData.customer_feedback}
                  placeholder="Pls enter customer feedback..."
                  onChange={(e) => handleInputChange(e, "customer_feedback")}
                />
              </div>
            </div>

            {/* Delivery Section */}
            <div className="grid grid-cols-5 gap-6 mb-6">
            
              <div>
                <label className="block text-sm font-medium mb-2">
                  Special Instructions
                </label>
                <Input
                  type="text"
                  value={replyData.special_instruction}
                  placeholder="Pls enter special instruction..."
                  onChange={(e) => handleInputChange(e, "special_instruction")}
                />
              </div>
        

            {/* Shipping Section */}
          
              <div>
                <label className="block text-sm font-medium mb-2">
                  Cargo Dispatch
                </label>
                <Input
                  type="date"
                  value={replyData.cargo_dispatch}
                  onChange={(e) => handleInputChange(e, "cargo_dispatch")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Stuffing Date
                </label>
                <Input
                  type="date"
                  value={replyData.stuffing_date}
                  onChange={(e) => handleInputChange(e, "stuffing_date")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Final Product Sample BLR
                </label>
                <Input
                  type="date"
                  value={replyData.f_product_sample_blr}
                  onChange={(e) => handleInputChange(e, "f_product_sample_blr")}
                />
              </div>
              <RadioOption
                label="Received BLR"
                value="received_blr"
                onChange={handleInputChange}
                currentValue={replyData.received_blr}
              />
            </div>

            {/* Sample Processing Section */}
            <div className="grid grid-cols-2 gap-6 mb-6">
            
              <div>
                <label className="block text-sm font-medium mb-2">
                  Final Product Sample SB
                </label>
                <Input
                  type="date"
                  value={replyData.f_product_sample_sb}
                  onChange={(e) => handleInputChange(e, "f_product_sample_sb")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Report Date
                </label>
                <Input
                  type="date"
                  value={replyData.report_dt}
                  onChange={(e) => handleInputChange(e, "report_dt")}
                />
              </div>
            </div>

            {/* Shipment Dates */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Shipment ETD
                </label>
                <Input
                  type="date"
                  value={replyData.shipment_etd}
                  onChange={(e) => handleInputChange(e, "shipment_etd")}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Shipment ETA
                </label>
                <Input
                  type="date"
                  value={replyData.shipment_eta}
                  onChange={(e) => handleInputChange(e, "shipment_eta")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col items-end">
          {updateEnquiryMutation.isPending && <ProgressBar progress={70} />}
          <Button
            type="submit"
            className="bg-yellow-500 text-black hover:bg-yellow-400 flex items-center mt-2"
            disabled={updateEnquiryMutation.isPending}
          >
            {updateEnquiryMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Reply"
            )}
          </Button>
        </div>
      </form>
    </Page>
  );
};

export default EnquiryReplyEdit;
