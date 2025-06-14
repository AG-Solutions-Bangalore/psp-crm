import {
  ErrorComponent,
  LoaderComponent,
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import BASE_URL from "@/config/BaseUrl";
import { decryptId } from "@/utils/encyrption/Encyrption";
import { Printer } from "lucide-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
const InvoicePytho = () => {
  const containerRef = useRef();

  const { id } = useParams();
  const decryptedId = decryptId(id);

  const [spiceBoard, setSpiceBoard] = useState(null);
  const [spiceBoardBranch, setSpiceBoardBranch] = useState(null);
  const [invoiceSubData, setInvoiceSubData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContractData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-fetch-invoice-view-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch invoice data");
      }

      const data = await response.json();
      setSpiceBoard(data?.invoice);
      setSpiceBoardBranch(data?.branch);
      setInvoiceSubData(data?.invoiceSub);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchContractData();
  }, [decryptedId]);
  const handlPrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "apta",
    pageStyle: `
                @page {
                size: auto;
                margin: 5mm;
                
              }
              @media print {
                body {
                  border: 0px solid #000;
                      font-size: 10px; 
                  margin: 0mm;
                  padding: 0mm;
                  min-height: 100vh;
                }
                   table {
                   font-size: 11px;
                 }
                .print-hide {
                  display: none;
                }
               
              }
              `,
  });
  const handleSaveAsWord = () => {
    const container = containerRef.current;

    // Get all stylesheet rules from the document
    const styleSheets = Array.from(document.styleSheets);
    let cssRules = [];

    styleSheets.forEach((sheet) => {
      try {
        // Get CSS rules from each stylesheet
        const rules = Array.from(sheet.cssRules || sheet.rules);
        cssRules = [...cssRules, ...rules];
      } catch (e) {
        // Handle CORS restrictions for external stylesheets
        console.log("Could not access stylesheet rules");
      }
    });

    // Convert CSS rules to text
    const stylesText = cssRules.map((rule) => rule.cssText).join("\n");

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
          <meta charset="utf-8">
          <style>
            ${stylesText}
          </style>
        </head>
        <body>
          ${container.innerHTML}
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/msword" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Pytho.doc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return <WithoutLoaderComponent name="Invoice Pytho Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (error) {
    return (
      <WithoutErrorComponent
        message="Error Fetching Invoice Pytho  Data"
        refetch={() => fetchContractData}
      />
    );
  }
  return (
    <div>
      <div>
        {/* <button
          onClick={handleSaveAsWord}
          className="fixed top-5 right-24 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600"
        >
          <FaRegFileWord className="w-4 h-4" />
        </button> */}
        <button
          onClick={handlPrintPdf}
          className="fixed top-5 right-10 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600"
        >
          <Printer className="h-4 w-4" />
        </button>
      </div>
      <div ref={containerRef} className="max-w-3xl mx-auto p-6 bg-white  ">
        <div className="">
          <p className="text-end text-base">Annexure-IV</p>
        </div>
        <div className="mt-5">
          <p className="text-center font-bold  underline decoration-1 decoration-green-300 underline-offset-2 text-xl">
            DECLARATION TO BE PROVIDED BY THE REGISTERED WAREHOUSE UNIT TO
            MERCHANT EXPORTERS FOR EXPORT OF DRY CHILLI{" "}
          </p>
        </div>

        <div className="mt-10 text-center font-bold text-2xl underline decoration-1 underline-offset-2">
          <p>DECLARATION</p>
        </div>

        <div className=" mt-10">
          <p className=" leading-relaxed text-base">
            It is declared that M/S Nifco Seafrieght Pvt.Ltd.,(name of the
            registered warehouse unit with Registration No. 04/2018-Warehouse dt
            12.03.2018 has processed{" "}
            {invoiceSubData?.reduce(
              (total, currItem) =>
                total + (parseFloat(currItem?.invoiceSub_qntyInMt) || 0),
              0
            )}{" "}
            MT of {spiceBoard?.invoice_product} in our unit as per “SOP for
            Export of Dry Chilli” and export through to M/S{" "}
            {spiceBoard?.branch_name}, {spiceBoard?.branch_address}(complete
            address of the merchant exporter) as per attached Invoice Nos.{" "}
            {spiceBoard?.invoice_ref} dated{" "}
            {moment(spiceBoard?.invoice_date).format("DD-MM-YYYY")} for export.
          </p>
        </div>
        <div className=" mt-8">
          <p className=" leading-relaxed text-base">
            The merchant exporter/trader has loaded the containers at our
            approved processing facility to avoid mixing with other commodities
            to prevent cross infestation. The inspection of the consignment has
            also been carried out by the Plant Quarantine Officer at the
            premises of registered Warehouse.
          </p>
        </div>
        <div className=" mt-8 ">
          <p className=" leading-relaxed  text-base">
            We own responsibility for any interception in the referred
            consignment. The merchant exporter/trader shall be responsible for
            Phytosanitary security of the consignment and any delay in dispatch
            or mishandling of container at ICD/Port shall be intimated to the
            registered Warehouse and concerned PQ Office.
          </p>
        </div>

        <div className="mt-24 text-base grid grid-cols-3">
          <div className=" col-span-2">
            <p>Signature: </p>
            <p>Name: Uday Rao</p>
            <p>Designation: Director</p>
            <p>Name of the registered warehouse unit:</p>
            <p>Nifco Seafreight Pvt.Ltd.</p>
            <p>Registration Certificate No. 04/2018-Warehouse</p>
            <p>Date: {moment(spiceBoard?.invoice_date).format("DD-MM-YYYY")}</p>
          </div>
          <div className=" col-span-1">
            <p>Signature:</p>
            <p>Name: {spiceBoardBranch.branch_sign_name1}</p>
            <p>Authorised Signatory</p>
            <p>Name of merchant exporter</p>
            <p>{spiceBoard?.branch_name}</p>
            <p>Date:{moment(spiceBoard?.invoice_date).format("DD-MM-YYYY")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePytho;
