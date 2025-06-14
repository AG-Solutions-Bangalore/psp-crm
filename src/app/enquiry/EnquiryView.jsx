import React, { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  Globe,
  Calendar,
  Clock,
  Package,
  TestTubes,
  Truck,
  Printer,
  Loader2,
} from "lucide-react";
import Page from "../dashboard/page";
import { useParams } from "react-router-dom";

import { useReactToPrint } from "react-to-print";

const PrintableEnquiry = React.forwardRef(({ enquiryDetails }, ref) => {
  const InfoSection = ({ title, items }) => (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">{title}</h2>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item, index) => (
          <div key={index} className="text-sm p-2 border border-gray-100">
            <span className="font-medium inline-block min-w-[120px]">
              {item.label}:{" "}
            </span>
            <span className="text-gray-600">{item.value || "N/A"}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const ProductsTable = ({ products }) => {
    const optionalHeaders = [
      { key: "enquirySub_product_code", label: "Product Code" },
      { key: "enquirySub_stem_type", label: "Stem Type" },
      { key: "enquirySub_moist_value", label: "Moisture Value" },
      { key: "enquirySub_final_price", label: "Final Price" },
      { key: "enquirySub_p2b_blend", label: "P2B Blend" },
    ];

    return (
      <div className="mb-6">
        <table className="w-full border-collapse border border-gray-800">
          <thead>
            <tr>
              <th className="border border-gray-800 p-1 text-sm">
                Product Name
              </th>
              <th className="border border-gray-800 p-1 text-sm">SHU</th>
              <th className="border border-gray-800 p-1 text-sm">ASTA</th>
              <th className="border border-gray-800 p-1 text-sm">
                Quality Type
              </th>
              <th className="border border-gray-800 p-1 text-sm">
                Course Type
              </th>
              <th className="border border-gray-800 p-1 text-sm">Quantity</th>
              <th className="border border-gray-800 p-1 text-sm">
                Quoted Price
              </th>
              {optionalHeaders.map(
                (header) =>
                  products?.some((product) => product[header.key]) && (
                    <th
                      key={header.key}
                      className="border border-gray-800 p-1 text-sm"
                    >
                      {header.label}
                    </th>
                  )
              )}
            </tr>
          </thead>
          <tbody>
            {products?.map((product, index) => (
              <tr key={index}>
                <td className="border border-gray-800 p-1 text-sm">
                  {product.enquirySub_product_name}
                </td>
                <td className="border border-gray-800 p-1 text-sm">
                  {product.enquirySub_shu}
                </td>
                <td className="border border-gray-800 p-1 text-sm">
                  {product.enquirySub_asta}
                </td>
                <td className="border border-gray-800 p-1 text-sm">
                  {product.enquirySub_qlty_type}
                </td>
                <td className="border border-gray-800 p-1 text-sm">
                  {product.enquirySub_course_type}
                </td>
                <td className="border border-gray-800 p-1 text-sm">
                  {product.enquirySub_qnty}
                </td>
                <td className="border border-gray-800 p-1 text-sm">
                  {product.enquirySub_quoted_price}
                </td>
                {optionalHeaders.map(
                  (header) =>
                    products?.some((p) => p[header.key]) && (
                      <td
                        key={header.key}
                        className="border border-gray-800 p-1 text-sm"
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
  };
  return (
    <div ref={ref} className="print-content p-4">
      {/* Company Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Aditya Spice</h1>
        <p className="text-sm">123 Business Street, Javanagar Layout</p>
        <p className="text-sm">
          Contact: +1234567890 | Email: info@adityaspice.com
        </p>
      </div>

      {/* Enquiry Header */}
      <div className="flex justify-between mb-6">
        <div>
          <p className="font-bold">
            Ref: {enquiryDetails?.enquiry?.enquiry_ref || "N/A"}
          </p>
          <p className="text-sm">
            Status: {enquiryDetails?.enquiry?.enquiry_status || "N/A"}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold">
            {enquiryDetails?.customer?.customer_name || "N/A"}
          </p>
          <p className="text-sm">
            Country: {enquiryDetails?.customer?.customer_country || "N/A"}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <InfoSection
        title="Basic Information"
        items={[
          {
            label: "Enquiry Date",
            value: enquiryDetails?.enquiry?.enquiry_date,
          },
          {
            label: "Packing Type",
            value: enquiryDetails?.enquiry?.packing_type,
          },
          { label: "Marking", value: enquiryDetails?.enquiry?.marking },
          {
            label: "Shipment Date",
            value: enquiryDetails?.enquiry?.shipment_date,
          },
          {
            label: "Sample Required",
            value: enquiryDetails?.enquiry?.sample_required,
          },
          {
            label: "Production Date",
            value: enquiryDetails?.enquiry?.production_date,
          },
        ]}
      />

      {/* Treatment Information */}
      <InfoSection
        title="Treatment Information"
        items={[
          {
            label: "Special Instruction",
            value: enquiryDetails?.enquiry?.special_instruction,
          },
          {
            label: "Treatment Required",
            value: enquiryDetails?.enquiry?.treatment_required,
          },
          { label: "ETD", value: enquiryDetails?.enquiry?.etd },
          {
            label: "Gama Radiations",
            value: enquiryDetails?.enquiry?.gama_rediations,
          },
          {
            label: "Steam Sterilization",
            value: enquiryDetails?.enquiry?.steam_sterlizaton,
          },
        ]}
      />

      {/* Products Table */}
      <h2 className="text-lg font-bold mb-3">Products Information</h2>
      <ProductsTable products={enquiryDetails?.enquirySub} />

      {/* Sample Information */}
      <InfoSection
        title="Sample Information"
        items={[
          {
            label: "Completion Date",
            value: enquiryDetails?.enquiry?.completion_date,
          },
          {
            label: "UCT Sample Bangalore",
            value: enquiryDetails?.enquiry?.uct_sample_bangalore,
          },
          {
            label: "Sample Received",
            value: enquiryDetails?.enquiry?.received,
          },
          {
            label: "Sample Dispatch",
            value: enquiryDetails?.enquiry?.ple_dispatch_customer,
          },
          { label: "Delivered", value: enquiryDetails?.enquiry?.delivered },
          {
            label: "Customer Feedback",
            value: enquiryDetails?.enquiry?.customer_feedback,
          },
        ]}
      />

      {/* Shipping Information */}
      <InfoSection
        title="Shipping Information"
        items={[
          {
            label: "Cargo Dispatch",
            value: enquiryDetails?.enquiry?.cargo_dispatch,
          },
          {
            label: "Stuffing Date",
            value: enquiryDetails?.enquiry?.stuffing_date,
          },
          {
            label: "Final Product Sample BLR",
            value: enquiryDetails?.enquiry?.f_product_sample_blr,
          },
          {
            label: "Received BLR",
            value: enquiryDetails?.enquiry?.received_blr,
          },
          {
            label: "Final Product Sample SB",
            value: enquiryDetails?.enquiry?.f_product_sample_sb,
          },
          { label: "Report Date", value: enquiryDetails?.enquiry?.report_dt },
          {
            label: "Shipment ETD",
            value: enquiryDetails?.enquiry?.shipment_etd,
          },
          {
            label: "Shipment ETA",
            value: enquiryDetails?.enquiry?.shipment_eta,
          },
        ]}
      />

      <style jsx global>{`
        @media print {
          @page {
            margin: 2mm;
            size: A4;
          }

          body * {
            visibility: hidden;
          }

          .print-content,
          .print-content * {
            visibility: visible;
          }

          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          table {
            page-break-inside: avoid;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
});

// Header Component
const EnquiryHeader = ({ enquiryDetails,handlePrint }) => {
  return (
    <div className="flex sticky top-0 z-10 border border-gray-200 rounded-lg justify-between items-start gap-8 mb-2 bg-white p-4 shadow-sm">
      <div className="flex-1">
        <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-gray-800">Enquiry Details</h1>
          <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded">
            {enquiryDetails?.enquiry?.enquiry_status || "-"}
          </span>
          </div>
          <div>
          <Button
            onClick={handlePrint}
            className="bg-yellow-500 text-black hover:bg-yellow-400"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-end gap-2 text-sm">
          <Building2 className="h-4 w-4 text-yellow-500" />
          <span>{enquiryDetails?.customer?.customer_name || "N/A"}</span>
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

const EnquiryView = () => {
  const { id } = useParams();
  const componentRef = useRef();
  const {
    data: enquiryDetails,
    isLoading,
    isError,
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

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Enquiry-${
      enquiryDetails?.enquiry?.enquiry_ref || "Report"
    }`,
    pageStyle: `
      @page {
        size: A4;
        margin: 2mm;
      }
    `,
  });

 

  const InfoSection = ({ title, children }) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
      <div className="grid grid-cols-3 gap-4">{children}</div>
    </div>
  );

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <Icon className="h-4 w-4 text-yellow-600 shrink-0" />
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );

  const ProductsTable = ({ products }) => {
    const optionalHeaders = [
      { key: "enquirySub_product_code", label: "Product Code" },
      { key: "enquirySub_stem_type", label: "Stem Type" },
      { key: "enquirySub_moist_value", label: "Moisture Value" },
      { key: "enquirySub_final_price", label: "Final Price" },
      { key: "enquirySub_p2b_blend", label: "P2B Blend" },
    ];

    return (
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-yellow-500">
              <th className="p-2 text-left border border-gray-200 font-medium text-black">
                Product Name
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-black">
                SHU
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-black">
                ASTA
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-black">
                Quality Type
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-black">
                Course Type
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-black">
                Quantity
              </th>
              <th className="p-2 text-left border border-gray-200 font-medium text-black">
                Quoted Price
              </th>
              {optionalHeaders.map(
                (header) =>
                  products?.some((product) => product[header.key]) && (
                    <th
                      key={header.key}
                      className="p-2 text-left border border-gray-200 font-medium text-black"
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
                {optionalHeaders.map(
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
            </CardContent>
          </Card>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="w-full p-4">
        {/* <div className="flex justify-end mb-4">
          <Button
            onClick={handlePrint}
            className="bg-yellow-500 text-black hover:bg-yellow-400"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div> */}
        <div className="hidden print:block">
          <PrintableEnquiry
            ref={componentRef}
            enquiryDetails={enquiryDetails}
          />
        </div>

        <div className="space-y-6">
          <EnquiryHeader enquiryDetails={enquiryDetails} handlePrint={handlePrint}/>

          <Card>
            <CardContent className="p-6">
              <InfoSection title="Basic Information">
                <InfoItem
                  icon={Calendar}
                  label="Enquiry Date"
                  value={enquiryDetails?.enquiry?.enquiry_date}
                />
                <InfoItem
                  icon={Package}
                  label="Packing Type"
                  value={enquiryDetails?.enquiry?.packing_type}
                />
                <InfoItem
                  icon={FileText}
                  label="Marking"
                  value={enquiryDetails?.enquiry?.marking}
                />
                <InfoItem
                  icon={Calendar}
                  label="Shipment Date"
                  value={enquiryDetails?.enquiry?.shipment_date}
                />
                <InfoItem
                  icon={TestTubes}
                  label="Sample Required"
                  value={enquiryDetails?.enquiry?.sample_required}
                />
                <InfoItem
                  icon={Calendar}
                  label="Production Date"
                  value={enquiryDetails?.enquiry?.production_date}
                />
              </InfoSection>
              <InfoSection title="Treatment Information">
                <InfoItem
                  icon={FileText}
                  label="Special Instruction"
                  value={enquiryDetails?.enquiry?.special_instruction}
                />
                <InfoItem
                  icon={TestTubes}
                  label="Treatment Required"
                  value={enquiryDetails?.enquiry?.treatment_required}
                />
                <InfoItem
                  icon={Clock}
                  label="ETD"
                  value={enquiryDetails?.enquiry?.etd}
                />
                <InfoItem
                  icon={TestTubes}
                  label="Gama Radiations"
                  value={enquiryDetails?.enquiry?.gama_rediations}
                />
                <InfoItem
                  icon={TestTubes}
                  label="Steam Sterilization"
                  value={enquiryDetails?.enquiry?.steam_sterlizaton}
                />
              </InfoSection>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Products Information
                </h3>
                <ProductsTable products={enquiryDetails?.enquirySub} />
              </div>

              <InfoSection title="Sample Information">
                <InfoItem
                  icon={Clock}
                  label="Completion Date"
                  value={enquiryDetails?.enquiry?.completion_date}
                />
                <InfoItem
                  icon={Calendar}
                  label="UCT Sample Bangalore"
                  value={enquiryDetails?.enquiry?.uct_sample_bangalore}
                />
                <InfoItem
                  icon={TestTubes}
                  label="Sample Received"
                  value={enquiryDetails?.enquiry?.received}
                />
                <InfoItem
                  icon={Calendar}
                  label="Sample Dispatch"
                  value={enquiryDetails?.enquiry?.ple_dispatch_customer}
                />
                <InfoItem
                  icon={Truck}
                  label="Delivered"
                  value={enquiryDetails?.enquiry?.delivered}
                />
                <InfoItem
                  icon={FileText}
                  label="Customer Feedback"
                  value={enquiryDetails?.enquiry?.customer_feedback}
                />
              </InfoSection>

              <InfoSection title="Shipping Information">
                <InfoItem
                  icon={Truck}
                  label="Cargo Dispatch"
                  value={enquiryDetails?.enquiry?.cargo_dispatch}
                />
                <InfoItem
                  icon={Calendar}
                  label="Stuffing Date"
                  value={enquiryDetails?.enquiry?.stuffing_date}
                />
                <InfoItem
                  icon={Calendar}
                  label="Final Product Sample BLR"
                  value={enquiryDetails?.enquiry?.f_product_sample_blr}
                />
                <InfoItem
                  icon={TestTubes}
                  label="Received BLR"
                  value={enquiryDetails?.enquiry?.received_blr}
                />
                <InfoItem
                  icon={Calendar}
                  label="Final Product Sample SB"
                  value={enquiryDetails?.enquiry?.f_product_sample_sb}
                />
                <InfoItem
                  icon={Calendar}
                  label="Report Date"
                  value={enquiryDetails?.enquiry?.report_dt}
                />
                <InfoItem
                  icon={Calendar}
                  label="Shipment ETD"
                  value={enquiryDetails?.enquiry?.shipment_etd}
                />
                <InfoItem
                  icon={Calendar}
                  label="Shipment ETA"
                  value={enquiryDetails?.enquiry?.shipment_eta}
                />
              </InfoSection>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default EnquiryView;
