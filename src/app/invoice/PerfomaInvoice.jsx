import {
  ErrorComponent,
  LoaderComponent,
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import BASE_URL from "@/config/BaseUrl";
import { decryptId } from "@/utils/encyrption/Encyrption";
import html2pdf from "html2pdf.js";
import { Printer } from "lucide-react";
import moment from "moment";
import { toWords } from "number-to-words";
import { useEffect, useRef, useState } from "react";
import { FaRegFilePdf } from "react-icons/fa";
import { useParams } from "react-router-dom";
import ReactToPrint from "react-to-print";
const PerfomaInvoice = () => {
  const containerRef = useRef();
  const { id } = useParams();
  const decryptedId = decryptId(id);

  const [invoicePackingData, setInvoicePackingData] = useState(null);
  const [branchData, setBranchData] = useState({});
  const [invoiceSubData, setInvoiceSubData] = useState([]);
  const [sumbag, setSumBag] = useState(0);
  const [prouducthsn, setProuductHsn] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (invoiceSubData.length > 0) {
      const totalBags = invoiceSubData.reduce((sum, item) => {
        return sum + (item.invoiceSub_item_bag || 0);
      }, 0);
      setSumBag(totalBags);
    }
  }, [invoiceSubData]);

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

  const handleSaveAsPdf = () => {
    const element = containerRef.current;

    const images = element.getElementsByTagName("img");
    let loadedImages = 0;

    if (images.length === 0) {
      generatePdf(element);
      return;
    }

    Array.from(images).forEach((img) => {
      if (img.complete) {
        loadedImages++;
        if (loadedImages === images.length) {
          generatePdf(element);
        }
      } else {
        img.onload = () => {
          loadedImages++;
          if (loadedImages === images.length) {
            generatePdf(element);
          }
        };
      }
    });
  };

  const generatePdf = (element) => {
    const options = {
      margin: [0, 0, 0, 0],
      filename: "Invoice_Performal.pdf",
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

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          const text = `Page ${i} of ${totalPages}`;
          const textWidth =
            (pdf.getStringUnitWidth(text) * 10) / pdf.internal.scaleFactor;
          const x = pageWidth - textWidth - 10;
          const y = pageHeight - 10;
          pdf.text(text, x, y);
        }
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
    link.download = "Invoice_Performal.doc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };
  if (loading) {
    return <WithoutLoaderComponent name=" Perfomal Invoice Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (error) {
    return (
      <WithoutErrorComponent
        message="Error Fetching Perfomal Invoice  Data"
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
        className="fixed top-5 right-24 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600"
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
        documentTitle={`contract-view`}
        pageStyle={`
                            @page {
                                size: auto;
                                margin: 0mm;
                            }
                            @media print {
                                body {
                                //  border: 1px solid #000;
                                    // margin: 1mm;
                                    //  padding: 1mm;
                                     min-height:100vh
                                }
                                .print-hide {
                                    display: none;
                                }
                                    .page-break {
            page-break-before: always;
        }
            
                            }
                        `}
      />

      <div ref={containerRef} className="min-h-screen font-normal ">
        {/* //INVOICE 1 START */}
        {invoicePackingData && (
          <>
            <div className="max-w-4xl mx-auto    p-4 ">
              <div className=" border border-black max-w-screen-lg mx-auto text-sm">
                <div>
                  <div className="border-b border-black px-8 py-2  text-center text-sm font-bold  ">
                    PROFORMA INVOICE
                  </div>
                </div>

                <div className="grid grid-cols-12  border-b border-black text-[12px]">
                  <div className="col-span-5 border-r border-black pl-4 pb-2">
                    <p className="font-bold">EXPORTER / SHIPPER :</p>
                    <p className="font-bold">
                      {invoicePackingData.branch_name}
                    </p>
                    <div>{invoicePackingData.branch_address}</div>
                  </div>

                  <div className="col-span-7 grid grid-rows-3 ">
                    <div className="flex justify-between border-b border-black p-2">
                      <div className="font-bold">
                        Inv. No. & Dt.: {invoicePackingData.invoice_ref}
                      </div>
                      <div>
                        Date:
                        {moment(invoicePackingData.invoice_date).format(
                          "DD-MM-YYYY"
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between border-b border-black p-2">
                      <div className="font-bold">
                        ORDER TYPE: {invoicePackingData.contract_pono}
                      </div>
                      <div className="col-span-2 text-left">
                        {moment(invoicePackingData.contract_date).format(
                          "DD-MM-YYYY"
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 px-2">
                      <div className="border-r border-black pr-2 mb-1 h-full">
                        <p className="font-bold">State Code</p>
                        <p>{branchData.branch_state_no}</p>
                      </div>
                      <div className="border-r border-black pr-2 mb-1 h-full">
                        <p className="font-bold">IEC Code</p>
                        <p>{branchData.branch_iec}</p>
                      </div>
                      <div className=" mb-1 h-full">
                        <p className="font-bold">GSTIN</p>
                        <p>{branchData.branch_gst}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center border-b border-black text-[12px]">
                  <div className="grid grid-cols-12 w-full">
                    <div className="border-r border-black px-4 col-span-5 text-[11px]">
                      <p className="font-bold">Consignee:</p>
                      <p className="font-bold">
                        {invoicePackingData.invoice_consignee}
                      </p>{" "}
                      <div>{invoicePackingData.invoice_consignee_add}</div>
                    </div>

                    <div className="col-span-7  ">
                      <div className="border-b border-black p-2 text-[10px] leading-3">
                        <div className="font-bold mb-[3px]">
                          Buyer (Other than Consignee):
                        </div>
                        <p className="mb-[3px] font-bold">
                          {invoicePackingData.invoice_consignee}
                        </p>
                        <div>{invoicePackingData.invoice_buyer_add}</div>
                      </div>

                      <div className="grid grid-cols-3 px-2">
                        <div className="border-r border-black pr-2 mb-[2px]">
                          <p className="font-bold text-[8px] text-center">
                            Country of origin of goods
                          </p>
                          <p className="text-center text-[12px]">INDIA</p>
                        </div>

                        <div className="border-r border-black pr-2 mb-[2px]"></div>
                        <div className=" pr-2 mb-[2px]">
                          <p className="font-bold text-[8px] text-center">
                            Country Destination:
                          </p>
                          <p className="text-center text-[12px]">
                            {" "}
                            {invoicePackingData.invoice_destination_country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b border-black text-[12px] h-full">
                  <div className="col-span-5 border-r border-black h-full">
                    <div className="grid grid-cols-2 px-2 h-full">
                      <div className="border-r border-black px-2 mb-[2px] h-full">
                        <p className="font-bold">Pre-carriage by:</p>
                        <p className="text-center">
                          {" "}
                          {invoicePackingData.invoice_precarriage}
                        </p>
                      </div>
                      <div className="px-2 h-full mb-[1px]">
                        <p className="font-bold">Pre-receipt at:</p>
                        <p className="text-center">
                          {" "}
                          {invoicePackingData.invoice_prereceipts}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 px-4">
                    <p className="font-bold  pb-1">
                      Terms of Delivery and Payment:
                    </p>
                    <p>
                      CIF USD {invoicePackingData.invoice_cif} PORT{" "}
                      {invoicePackingData.invoice_destination_country}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-12 border-b border-black text-[12px]  h-full">
                  <div className="col-span-5 border-r border-black  h-full">
                    <div className="grid grid-cols-2 px-2">
                      <div className="border-r border-black px-2 mb-[2px] h-full">
                        <p className="font-bold">Mode of shipment:</p>
                        <p className="text-center">BY SEA</p>
                      </div>
                      <div className="px-2 ">
                        <p className="font-bold">Port of Loading:</p>
                        <p className="text-center">
                          {invoicePackingData.invoice_loading}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 px-4">
                    <p className="flex items-center justify-center h-full w-full">
                      Insurance Terms - Exporter Warehouse to Consignee/Buyer
                      Warehouse
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-12 border-b border-black text-[12px]  h-full">
                  <div className="col-span-5 border-r border-black  h-full">
                    <div className="grid grid-cols-2 px-2  h-full">
                      <div className="border-r border-black px-2  h-full">
                        <p className="font-bold">Port of Discharge :</p>
                        <p className="text-center">
                          {" "}
                          {invoicePackingData.invoice_discharge}
                        </p>
                      </div>
                      <div className="px-2  h-full">
                        <p className="font-bold">Final Destination</p>
                        <p className="text-center">
                          {" "}
                          {invoicePackingData.invoice_destination_port}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 px-4">
                    <p className=" pb-1 text-[10px]">
                      <span className="font-bold"> PAYMENT BY -</span>{" "}
                      {invoicePackingData.invoice_payment_terms}
                    </p>
                  </div>
                </div>

                <div className="text-[12px]">
                  <table className="w-full border-collapse table-auto border-b border-black ">
                    <thead>
                      <tr className="border-b border-black text-[12px]">
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "20%" }}
                        >
                          Marks & Nos./ Container No.
                        </th>
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "10%" }}
                        >
                          No/KIND OF PACKAGE
                        </th>
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "30%" }}
                        >
                          DESCRIPTION OF EXPORT GOODS
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
                          style={{ width: "15%" }}
                        >
                          AMOUNT (USD)
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoiceSubData.map((item, index) => (
                        <>
                          <tr key={index}>
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
                              ${" "}
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
                  <p className="flex p-2">
                    AMOUNT CHARGEABLE IN WORDS -
                    <p className=" font-semibold ml-4">{totalInWords}</p>
                  </p>
                </div>
                <div className="grid grid-cols-2  text-[10px] mt-3">
                  <div className="col-span-1">
                    <div className=" px-2 leading-none">
                      <p className="font-bold mt-1">DECLARATION</p>
                      <p className="my-2">
                        WE DECLARE THAT THIS INVOICE SHOWS THE ACTUAL PRICE OF
                        THE GOODS DESCRIBED AND THAT ALL PARTICULARS ARE TRUE
                        AND CORRECT.
                      </p>
                    </div>
                  </div>

                  <div className="col-span-1 ">
                    <div className="border-t border-l border-black p-4 h-full">
                      <p className="font-bold leading-none">
                        SIGNATURE & DATE :
                      </p>
                      <p className="mt-2 leading-none"></p>
                      <p className="mt-6 leading-none">
                        {" "}
                        {moment().format("DD-MM-YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="page-break"></div>
            </div>
          </>
        )}
        {/* //INVOICE ONE END  */}
        {/* //PACKING 1 STARTS  */}
        {invoicePackingData && (
          <>
            <div className="max-w-4xl mx-auto    p-4">
              <div className=" border border-black max-w-screen-lg mx-auto text-sm">
                <div>
                  <div className="border-b border-black px-8 py-2  text-center text-sm font-bold  ">
                    PROFORMA PACKING LIST
                  </div>
                </div>

                <div className="grid grid-cols-12  border-b border-black text-[12px]">
                  <div className="col-span-5 border-r border-black pl-4 pb-2">
                    <p className="font-bold">EXPORTER / SHIPPER :</p>
                    <p className="font-bold">
                      {invoicePackingData.branch_name}
                    </p>
                    <div>{invoicePackingData.branch_address}</div>
                  </div>

                  <div className="col-span-7 grid grid-rows-3 ">
                    <div className="flex justify-between border-b border-black p-2">
                      <div className="font-bold">
                        Inv. No. & Dt.: {invoicePackingData.invoice_ref}
                      </div>
                      <div>
                        Date:
                        {moment(invoicePackingData.invoice_date).format(
                          "DD-MM-YYYY"
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between border-b border-black p-2">
                      <div className="font-bold">
                        ORDER TYPE: {invoicePackingData.contract_pono}
                      </div>
                      <div className="col-span-2 text-left">
                        {moment(invoicePackingData.contract_date).format(
                          "DD-MM-YYYY"
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 px-2">
                      <div className="border-r border-black pr-2 mb-1 h-full">
                        <p className="font-bold">State Code</p>
                        <p>{branchData.branch_state_no}</p>
                      </div>
                      <div className="border-r border-black pr-2 mb-1 h-full">
                        <p className="font-bold">IEC Code</p>
                        <p>{branchData.branch_iec}</p>
                      </div>
                      <div className=" pr-2 mb-1 h-full">
                        <p className="font-bold">GSTIN</p>
                        <p>{branchData.branch_gst}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center border-b border-black text-[12px]">
                  <div className="grid grid-cols-12 w-full">
                    <div className="border-r border-black px-4 col-span-5 text-[11px]">
                      <p className="font-bold">Consignee:</p>
                      <p className="font-bold">
                        {invoicePackingData.invoice_consignee}
                      </p>{" "}
                      <div>{invoicePackingData.invoice_consignee_add}</div>
                    </div>
                    <div className="col-span-7  ">
                      <div className="border-b border-black p-2 text-[10px] leading-3">
                        <div className="font-bold mb-[3px]">
                          Buyer (Other than Consignee):
                        </div>
                        <p className="mb-[3px] font-bold">
                          {invoicePackingData.invoice_consignee}
                        </p>
                        <div>{invoicePackingData.invoice_buyer_add}</div>
                      </div>

                      <div className="grid grid-cols-3 px-2">
                        <div className="border-r border-black pr-2 mb-[2px]">
                          <p className="font-bold text-[8px] text-center">
                            Country of origin of goods
                          </p>
                          <p className="text-center text-[12px]">INDIA</p>
                        </div>

                        <div className="border-r border-black pr-2 mb-[2px]"></div>
                        <div className=" pr-2 mb-[2px]">
                          <p className="font-bold text-[8px] text-center">
                            Country Destination:
                          </p>
                          <p className="text-center text-[12px]">
                            {" "}
                            {invoicePackingData.invoice_destination_country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b border-black text-[12px] h-full">
                  <div className="col-span-5 border-r border-black h-full">
                    <div className="grid grid-cols-2 px-2 h-full">
                      <div className="border-r border-black px-2 mb-[2px] h-full">
                        <p className="font-bold">Pre-carriage by:</p>
                        <p className="text-center">
                          {" "}
                          {invoicePackingData.invoice_precarriage}
                        </p>
                      </div>
                      <div className="px-2 h-full mb-[1px]">
                        <p className="font-bold">Pre-receipt at:</p>
                        <p className="text-center">
                          {" "}
                          {invoicePackingData.invoice_prereceipts}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 px-4"></div>
                </div>
                <div className="grid grid-cols-12 border-b border-black text-[12px]  h-full">
                  <div className="col-span-5 border-r border-black  h-full">
                    <div className="grid grid-cols-2 px-2">
                      <div className="border-r border-black px-2 mb-[2px] h-full">
                        <p className="font-bold">Mode of shipment:</p>
                        <p className="text-center">BY SEA</p>
                      </div>
                      <div className="px-2 ">
                        <p className="font-bold">Port of Loading:</p>
                        <p className="text-center">
                          {invoicePackingData.invoice_loading}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 px-4">
                    <p className="flex items-center justify-center h-full w-full"></p>
                  </div>
                </div>
                <div className="grid grid-cols-12 border-b border-black text-[12px]  h-full">
                  <div className="col-span-5 border-r border-black  h-full">
                    <div className="grid grid-cols-2 px-2  h-full">
                      <div className="border-r border-black px-2  h-full">
                        <p className="font-bold">Port of Discharge :</p>
                        <p className="text-center">
                          {" "}
                          {invoicePackingData.invoice_discharge}
                        </p>
                      </div>
                      <div className="px-2  h-full">
                        <p className="font-bold">Final Destination</p>
                        <p className="text-center">
                          {" "}
                          {invoicePackingData.invoice_destination_port}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 px-4"></div>
                </div>

                <div className="text-[12px]">
                  <table className="w-full border-collapse table-auto border-b border-black">
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
                          style={{ width: "10%" }}
                        >
                          No. / KIND OF PACKAGE
                        </th>
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "30%" }}
                        >
                          DESCRIPTION OF EXPORT GOODS
                        </th>
                        <th
                          className="border-r border-black p-2 px-3 text-center text-[11px]"
                          style={{ width: "10%" }}
                        >
                          QUANTITY IN MT
                        </th>

                        <th
                          className="p-2 text-center text-[11px]"
                          style={{ width: "15%" }}
                        >
                          REMARKS
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoiceSubData.map((item, index) => (
                        <tr key={index}>
                          <td className="border-r border-black p-2">
                            {item.invoiceSub_marking} <br />
                          </td>
                          <td className="border-r border-black p-2">
                            <p className="text-center">
                              {item.invoiceSub_item_bag}
                            </p>
                            <p className="text-center">
                              {item.invoiceSub_sbaga}
                            </p>
                          </td>
                          <td className="border-r border-black p-2">
                            {item.invoiceSub_descriptionofGoods && (
                              <p>{item.invoiceSub_descriptionofGoods}</p>
                            )}
                            {(item.invoiceSub_packing ||
                              item.invoiceSub_sbaga) && (
                              <p>
                                PACKED {item.invoiceSub_packing} KGS NET IN EACH{" "}
                                {item.invoiceSub_sbaga}
                              </p>
                            )}
                          </td>
                          <td className="border-r border-black p-2 text-center">
                            {item.invoiceSub_qntyInMt}MT
                          </td>

                          {index === invoiceSubData.length - 1 && (
                            <>
                              <tr>
                                <td className="p-2 text-left" colSpan={5}>
                                  <p> TOTAL GROSS WEIGHT:</p>
                                  <p className="ml-8">
                                    {/* {invoiceSubData.reduce(
                                      (total, item) =>
                                        total + (item.invoiceSub_item_bag || 0),
                                      0
                                    )}{" "} */}
                                    {invoiceSubData.reduce(
                                      (total, item) =>
                                        total +
                                        item.invoiceSub_item_bag *
                                          item.invoiceSub_bagsize,
                                      0
                                    )}
                                    KGS
                                  </p>
                                </td>
                              </tr>
                              <tr>
                                <td className="p-2 text-left" colSpan={5}>
                                  <p> TOTAL NET WEIGHT:</p>
                                  <p className="ml-8">
                                    {invoiceSubData.reduce(
                                      (total, item) =>
                                        total +
                                        (item.invoiceSub_qntyInMt * 1000 || 0),
                                      0
                                    )}{" "}
                                    KGS
                                  </p>
                                </td>
                              </tr>
                            </>
                          )}
                        </tr>
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
                        <td className=" p-2 text-right font-bold"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] ">
                  <p className="flex p-2"></p>

                  <p className="block font-semibold ml-4"></p>
                  <p className="block font-semibold ml-4 "></p>
                </div>
                <div className="grid grid-cols-2  text-[10px] mt-3">
                  <div className="col-span-1">
                    <div className=" px-2 leading-none">
                      <p className="font-bold"> </p>
                    </div>
                  </div>

                  <div className="col-span-1 ">
                    <div className="border-t border-l border-black p-4 h-full">
                      <p className="font-bold leading-none">
                        SIGNATURE & DATE :
                      </p>
                      <p className="mt-2 leading-none"></p>
                      <p className="mt-6 leading-none">
                        {" "}
                        {moment().format("DD-MM-YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {/* //PACKING 1 ENDS  */}
      </div>
    </div>
  );
};

export default PerfomaInvoice;
