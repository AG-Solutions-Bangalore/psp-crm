import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Printer } from "lucide-react";
import html2pdf from "html2pdf.js";
import BASE_URL from "@/config/BaseUrl";
import { useParams } from "react-router-dom";
import ReactToPrint from "react-to-print";
import moment from "moment";
import { toWords } from "number-to-words";
import { FaRegFileWord } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import { decryptId } from "@/utils/encyrption/Encyrption";
import {
  ErrorComponent,
  LoaderComponent,
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
const PreshipmentDetails = () => {
  const containerRef = useRef();

  const { id } = useParams();
  const decryptedId = decryptId(id);
  const [invoicePackingData, setInvoicePackingData] = useState(null);
  const [branchData, setBranchData] = useState({});
  const [invoiceSubData, setInvoiceSubData] = useState([]);
  const [prouducthsn, setProuductHsn] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sumbag, setSumBag] = useState(0);

  const logoUrl = "/api/public/assets/images/letterHead/AceB.png";
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
        throw new Error("Failed to fetch preshipmentData ");
      }

      const data = await response.json();
      setInvoicePackingData(data.invoice);
      setBranchData(data.branch);
      setInvoiceSubData(data.invoiceSub);
      setProuductHsn(data.producthsn);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchContractData();
  }, [decryptedId]);
  useEffect(() => {
    if (invoiceSubData.length > 0) {
      const totalBags = invoiceSubData.reduce((sum, item) => {
        return sum + (item.invoiceSub_item_bag || 0);
      }, 0);
      setSumBag(totalBags);
    }
  }, [invoiceSubData]);
  const handleSaveAsPdf = () => {
    const element = containerRef.current;
    generatePdf(element);
  };

  const generatePdf = (element) => {
    const options = {
      margin: [5, 5, 5, 5],
      filename: "Pre_Shipment.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        windowHeight: element.scrollHeight,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: "avoid" },
    };

    html2pdf()
      .from(element)
      .set(options)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        console.log(`Element Height: ${element.scrollHeight}`);
        console.log(`Page Width: ${pageWidth}, Page Height: ${pageHeight}`);
      })
      .save();
  };

  const handleSaveAsWord = () => {
    const content = containerRef.current.innerHTML;

    const styles = `
      <style>
        table { border-collapse: collapse; width: 100%; }
        td { border: 0px solid black; padding: 0px; }
      </style>
    `;

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head>
          <meta charset="utf-8">
          ${styles}
        </head>
        <body>
          ${content}
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "application/msword" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Pre_Shipment.doc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return <WithoutLoaderComponent name="Pre_Shipment Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (error) {
    return (
      <WithoutErrorComponent
        message="Error Fetching Pre_Shipment  Data"
        refetch={() => fetchContractData}
      />
    );
  }

  const totalAmount = invoiceSubData.reduce((total, item) => {
    return total + (item.invoiceSub_qntyInMt * item.invoiceSub_rateMT || 0);
  }, 0);

  const dollars = Math.floor(totalAmount);
  const cents = Math.round((totalAmount - dollars) * 100);
  const totalInWords = `${toWords(dollars).toUpperCase()} DOLLARS AND ${
    cents > 0 ? toWords(cents).toUpperCase() + " CENTS" : "NO CENTS"
  }`;
  return (
    <div>
      {/* <button
        onClick={handleSaveAsWord}
        className="fixed top-5 right-40 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600"
      >
        <FaRegFileWord className="w-4 h-4" />
      </button> */}

      <button
        onClick={handleSaveAsPdf}
        className="fixed top-5  right-24 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600"
      >
        <FaRegFilePdf className="w-4 h-4" />
      </button>
      <ReactToPrint
        trigger={() => (
          <button className="fixed top-5 right-10 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600">
            <Printer className="h-4 w-4" />
          </button>
        )}
        content={() => containerRef.current}
        documentTitle={`Preshiment-view`}
        pageStyle={`
          @page {
              size: auto;
              margin: 0mm;
          }
          @media print {
              body {
              //  border: 1px solid #000;
                  margin: 2mm;
                   padding: 2mm;
                
                   min-height:100vh
              }
               .page-break {
            page-break-before: always;
        }
          
          }
      `}
      />

      <div ref={containerRef} className="   min-h-screen font-normal ">
        <div className="max-w-4xl my-4 mx-auto">
          <h1 className="text-center text-[15px]  font-bold ">
            PRESHIPMENT CHECKING
          </h1>
        </div>
        {invoicePackingData && (
          <>
            <div className="max-w-4xl mx-auto text-[12px]">
              <div className="border border-black max-w-4xl mx-auto text-sm">
                <div className="grid grid-cols-12 border-b border-black text-[12px]">
                  <div className="col-span-5 border-r border-black p-1 font-bold">
                    <p>ACE EXPORTS</p>
                  </div>
                  <div className="col-span-7 grid grid-cols-4">
                    <div className="col-span-1 border-r border-black p-1 flex items-center">
                      Inv. No. & Dt:
                    </div>
                    <div className="col-span-2  border-r border-black p-1 flex items-center font-bold">
                      {invoicePackingData.invoice_ref}
                    </div>

                    <div className="col-span-1 p-1 flex items-center">
                      {moment(invoicePackingData.invoice_date).format(
                        "DD-MM-YYYY"
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-12 border-b border-black text-[12px]">
                  <div className="col-span-5 border-r border-black p-2 leading-tight">
                    {invoicePackingData.branch_address}
                  </div>
                  <div className="col-span-7 text-[12px]">
                    <div className="grid grid-cols-4   border-b border-black">
                      <div className="col-span-1 border-r  border-black p-1">
                        ORDER TYPE:
                      </div>
                      <div className="col-span-3 p-1 border-black flex items-center font-bold">
                        {invoicePackingData.contract_ref} Dt:
                        <span className="ml-2">
                          {" "}
                          {moment(invoicePackingData.contract_date).format(
                            "DD-MM-YYY"
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-2 border-b border-black">
                      <div className=" border-r  border-black p-1 text-center">
                        State Code
                      </div>
                      <div className="border-r border-black p-1 text-center">
                        IEC Code
                      </div>
                      <div className="border-r border-black p-1 col-span-2 text-center">
                        GSTIN
                      </div>
                      <div className=" p-1 text-center">HSN Code</div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="border-r border-black p-1 text-center">
                        {branchData.branch_state_no}
                      </div>
                      <div className="border-r border-black p-1 text-center">
                        {branchData.branch_iec}
                      </div>
                      <div className="border-r border-black p-1 col-span-2 text-center">
                        {branchData.branch_gst}
                      </div>
                      <div className=" p-1 text-center">
                        {prouducthsn.product_hsn}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b border-black">
                  {/* Buyer Section */}
                  <div className="col-span-5 border-r border-black text-[12px]">
                    <h2 className="font-bold text-center border-b border-black p-1">
                      Buyer
                    </h2>
                    <div className="grid grid-cols-2 leading-tight">
                      <div className="p-1 border-r border-black flex items-center justify-center h-full">
                        <h2 className="text-center">Buyer</h2>
                      </div>

                      <div className="p-1 text-center text-[12px]">
                        {invoicePackingData.invoice_buyer}
                        {invoicePackingData.invoice_buyer_add}
                      </div>
                    </div>
                  </div>

                  {/* Consignee and Consignee Bank Section */}
                  <div className="col-span-7 text-[12px]">
                    <div className="grid grid-cols-2 h-full">
                      {/* Consignee */}
                      <div className="border-r border-black">
                        <h2 className="font-bold border-b border-black p-1 text-center">
                          Consignee
                        </h2>
                        <div className="p-1 text-center leading-tight">
                          {invoicePackingData.invoice_consignee}
                          {invoicePackingData.invoice_consignee_add}
                        </div>
                      </div>

                      {/* Consignee Bank */}
                      <div>
                        <h2 className="font-bold border-b border-black p-1 text-center">
                          Consignee Bank
                        </h2>
                        <div className="p-1 text-center leading-tight">
                          {invoicePackingData.invoice_consig_bank}
                          {invoicePackingData.invoice_consig_bank_address}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b border-black">
                  <div className="col-span-5 border-r border-black text-[12px]">
                    <h2 className="p-1 py-4">
                      {invoicePackingData.invoice_product_cust_des}
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-5 border-b border-black text-[12px]">
                  <div className="border-r border-black h-full p-1 text-center ">
                    <p className="font-bold">Pre-carriage by: </p>
                  </div>
                  <div className="px-2 p-1 h-full text-center border-r border-black ">
                    <p className="font-bold">Port of Loading:</p>
                  </div>
                  <div className="px-2 h-full border-r border-black p-1 text-center">
                    <p className="font-bold">Port of Discharge:</p>
                  </div>
                  <div className="px-2 h-full border-r border-black p-1 text-center">
                    <p className="font-bold">Final Destination:</p>
                  </div>
                  <div className="px-2 h-full  p-1 text-center">
                    <p className="font-bold">Country Destination:</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 border-b border-black text-[12px]">
                  <div className="border-r border-black px-2 h-full p-1 text-center">
                    <p className="text-center font-bold">
                      {" "}
                      {invoicePackingData.invoice_precarriage}
                    </p>
                  </div>
                  <div className="border-r border-black px-2 h-full p-1 text-center">
                    <p className="text-center font-bold">
                      {" "}
                      {invoicePackingData.invoice_loading},INDIA
                    </p>
                  </div>
                  <div className="border-r border-black px-2 h-full p-1 text-center">
                    <p className="text-center font-bold">
                      {" "}
                      {invoicePackingData.invoice_discharge}
                    </p>
                  </div>
                  <div className="border-r border-black px-2 h-full p-1 text-center">
                    <p className="text-center font-bold">
                      {" "}
                      {invoicePackingData.invoice_destination_port}
                    </p>
                  </div>
                  <div className=" px-2 h-full p-1 text-center">
                    <p className="text-center font-bold">
                      {" "}
                      {invoicePackingData.invoice_destination_country}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-5 border-b border-black text-[12px]">
                  <div className="border-r border-black h-full p-1 text-center ">
                    <p>CIF USD</p>
                  </div>
                  <div className="px-2 p-1 h-full border-r border-black ">
                    <p> {invoicePackingData.invoice_cif}</p>
                  </div>
                  <div className="px-2 h-full p-1 col-span-3">
                    <p> {invoicePackingData.invoice_destination_country}</p>
                  </div>
                </div>

                <div className="text-[12px]">
                  <table className="w-full border-collapse table-auto border-b border-black leading-[13px]">
                    <thead>
                      <tr className="border-b border-black">
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "20%" }}
                        >
                          Marks & Nos./ Container No.
                        </th>
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "12%" }}
                        >
                          No. / KIND OF
                        </th>
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "30%" }}
                        >
                          <p> DESCRIPTION OF EXPORT GOODS</p>{" "}
                          {prouducthsn.product_hs}
                        </th>
                        <th
                          className="border-r border-black p-2 px-3 text-center text-[11px]"
                          style={{ width: "10%" }}
                        >
                          QUANTITY IN MT
                        </th>
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "10%" }}
                        >
                          RATE PER MT IN USD
                        </th>
                        <th
                          className="p-2 text-center text-[11px]"
                          style={{ width: "13%" }}
                        >
                          AMOUNT (USD)
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoiceSubData.map((item, index) => (
                        <>
                          <tr>
                            <td className="border-r border-black p-2">
                              {item.invoiceSub_marking} <br />
                            </td>
                            <td className="border-r border-black p-2">
                              <p className="text-center">
                                {" "}
                                {item.invoiceSub_item_bag}
                              </p>{" "}
                              <p className="text-center">
                                {" "}
                                {item.invoiceSub_sbaga}
                              </p>{" "}
                            </td>
                            <td className="border-r border-black p-2">
                              {item.invoiceSub_item_name && (
                                <p>{item.invoiceSub_item_name}</p>
                              )}

                              {item.invoiceSub_descriptionofGoods && (
                                <p>{item.invoiceSub_descriptionofGoods}</p>
                              )}
                              {(item.invoiceSub_packing ||
                                item.invoiceSub_sbaga) && (
                                <p>
                                  PACKED {item.invoiceSub_packing} KGS NET IN
                                  EACH {item.invoiceSub_sbaga}
                                </p>
                              )}
                            </td>
                            <td className="border-r border-black p-2 text-center">
                              {item.invoiceSub_qntyInMt}
                            </td>
                            <td className="border-r border-black p-2 text-center">
                              {item.invoiceSub_rateMT}
                            </td>
                            <td className="p-2 text-right">
                              $
                              {(
                                item.invoiceSub_qntyInMt *
                                item.invoiceSub_rateMT
                              ).toFixed(2)}
                            </td>
                          </tr>
                        </>
                      ))}

                      <tr>
                        <td className="border-r border-black p-2">
                          <br />
                          <span className="font-bold block text-[11px]">
                            (IN {invoicePackingData.invoice_container_size})
                          </span>
                          <span className="font-bold text-[10px]">
                            ( {sumbag} BAGS IN{" "}
                            {invoicePackingData.invoice_container_size})
                          </span>
                        </td>
                        <td className="border-r border-black p-2"></td>
                        <td className="border-r border-black p-2"></td>
                        <td className="border-r border-black p-2"></td>
                        <td className="border-r border-black p-2"></td>
                        <td className="border-t border-black p-2 text-right font-bold">
                          $
                          {invoiceSubData
                            .reduce((total, item) => {
                              return (
                                total +
                                (item.invoiceSub_qntyInMt *
                                  item.invoiceSub_rateMT || 0)
                              );
                            }, 0)
                            .toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] ">
                  <p className="flex px-2">AMOUNT CHARGEABLE IN WORDS -</p>
                  <p className=" font-semibold ml-8">{totalInWords}</p>
                </div>

                <div className="grid grid-cols-12 text-[12px]">
                  <div className="col-span-5 p-2">
                    {" "}
                    <p className="flex px-2">
                      TOTAL NET WEIGHT :
                      <p className=" font-semibold ml-4">
                        {" "}
                        {invoiceSubData.reduce(
                          (total, item) =>
                            total + (item.invoiceSub_qntyInMt * 1000 || 0),
                          0
                        )}{" "}
                        KGS
                      </p>
                    </p>{" "}
                  </div>

                  <div className="col-span-5  p-2">
                    <p className="flex px-2">
                      TOTAL GROSS WEIGHT :
                      <p className=" font-semibold ml-4">
                        {" "}
                        {invoiceSubData.reduce(
                          (total, item) =>
                            total +
                            item.invoiceSub_item_bag * item.invoiceSub_bagsize,
                          0
                        )}{" "}
                        KGS{" "}
                      </p>
                    </p>{" "}
                  </div>
                  <div className="col-span-2"></div>
                </div>

                <div className="text-[12px] p-2 border-b border-black">
                  <h2 className="font-bold">
                    {invoicePackingData.invoice_lut_code}
                  </h2>
                  <h2 className="font-bold">
                    {invoicePackingData.invoice_gr_code}
                  </h2>
                </div>
                <div className="text-[12px] p-2">
                  <h2>Remark:{invoicePackingData.invoice_remarks}</h2>
                  <h2 className="flex justify-end p-6">Checked By</h2>
                </div>
              </div>
              <div className="page-break"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PreshipmentDetails;
