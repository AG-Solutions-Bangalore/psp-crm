import {
  ErrorComponent,
  LoaderComponent,
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BASE_URL from "@/config/BaseUrl";
import { decryptId } from "@/utils/encyrption/Encyrption";
import html2pdf from "html2pdf.js";
import { Loader2, Printer } from "lucide-react";
import { toWords } from "number-to-words";
import { useEffect, useRef, useState } from "react";
import { FaRegFilePdf, FaRegFileWord } from "react-icons/fa";
import { useParams } from "react-router-dom";
import ReactToPrint from "react-to-print";
const BlDraft = () => {
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
      filename: "Invoice_Packing.pdf",
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
    link.download = "Invoice_Packing.doc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };
  if (loading) {
    return <WithoutLoaderComponent name="BiDraft Data Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (error) {
    return (
      <WithoutErrorComponent
        message="Error Fetching BiDraft Data Data"
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
                <div className="border-b border-black px-[10rem] py-2 text-sm font-bold flex justify-between gap-4">
                  <span>DRAFT B/L</span>
                  <span>DRAFT B/L</span>
                  <span>DRAFT B/L</span>
                </div>

                <div className="grid grid-cols-12  border-b border-black text-[10px]">
                  <div className="col-span-5 border-r border-black pl-4 pb-2">
                    <p className="font-bold">SHIPPER :</p>
                    <p className="font-bold">
                      {invoicePackingData.branch_name}
                    </p>
                    <div>{invoicePackingData.branch_address}</div>
                  </div>

                  <div className="col-span-7">
                    <div className="p-2">
                      <p className="font-bold"> EXPORT REFERENCES:</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center items-center border-b border-black text-[10px]">
                  <div className="grid grid-cols-12 w-full">
                    <div className="border-r border-black p-2 col-span-5 text-[10px]">
                      <p className="font-bold">CONSIGNEE:</p>
                      <p className="font-bold">
                        {invoicePackingData.invoice_consignee}
                      </p>{" "}
                      <div>{invoicePackingData.invoice_consignee_add}</div>
                    </div>

                    <div className="col-span-7  ">
                      <div className=" p-2 text-[10px] leading-3"></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 border-b border-black text-[10px] h-full">
                  <div className="col-span-5 border-r border-black h-full">
                    <div className="h-full">
                      <div className="p-2 h-full">
                        <p className="font-bold">Vessal and Voyage No:</p>
                        <p>
                          {" "}
                          {invoicePackingData.invoice_vessel} /
                          {invoicePackingData.invoice_voyage}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 p-2">
                    <p className="font-bold  ">Place of Receipts :</p>
                    <p>{invoicePackingData.invoice_loading},INDIA</p>
                  </div>
                </div>
                <div className="grid grid-cols-12 border-b border-black text-[10px]  h-full">
                  <div className="col-span-5 border-r border-black  h-full">
                    <div className=" p-2">
                      <div className="px-2 mb-[2px] h-full">
                        <p className="font-bold">Port of Loading :</p>
                        <p>{invoicePackingData.invoice_loading},INDIA</p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 p-2">
                    <p className="h-full w-full">No. of Originals</p>
                  </div>
                </div>
                <div className="grid grid-cols-12 border-b border-black text-[10px]  h-full">
                  <div className="col-span-5 border-r border-black  h-full">
                    <div className=" p-2  h-full">
                      <div className=" px-2  h-full">
                        <p className="font-bold">Port of Discharge :</p>
                        <p>
                          {" "}
                          {invoicePackingData.invoice_discharge}/{" "}
                          {invoicePackingData.invoice_destination_country}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-7 p-2">
                    <p className=" pb-1 text-[10px]">
                      <p className="font-bold">Place of Delivery :</p>
                      <p>
                        {" "}
                        {invoicePackingData.invoice_destination_port} /{" "}
                        {invoicePackingData.invoice_destination_country}
                      </p>
                    </p>
                  </div>
                </div>

                <div className="text-[12px]">
                  <table className="w-full border-collapse table-auto border-b border-black ">
                    <thead>
                      <tr className="border-b border-black text-[12px]">
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "18%" }}
                        >
                          MARKS & NUMBERS.
                        </th>
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "10%" }}
                        >
                          NUMBER OF PACKAGE
                        </th>
                        <th
                          className="border-r border-black p-2 text-center text-[11px]"
                          style={{ width: "29%" }}
                        >
                          <p>KIND OF PACKAGES ;</p>
                          <p>DESCRIPTION OF EXPORT GOODS ;</p>
                        </th>
                        <th
                          className="border-r border-black p-2 px-3 text-center text-[11px]"
                          style={{ width: "15%" }}
                        >
                          GROSS WEIGHT
                        </th>
                        <th
                          className="p-2 text-center text-[11px]"
                          style={{ width: "8%" }}
                        >
                          MEASUREMENT
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {invoiceSubData.map((item, index) => (
                        <>
                          <tr key={index} className="text-[10px]">
                            <td className="border-r border-black p-2 ">
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
                              {index === invoiceSubData.length - 1 && (
                                <>
                                  <tr>
                                    <td className="p-2 text-left" colSpan={5}>
                                      <p> TOTAL NET WEIGHT:</p>
                                      <p className="ml-8">
                                        {invoiceSubData.reduce(
                                          (total, item) =>
                                            total +
                                            (item.invoiceSub_qntyInMt * 1000 ||
                                              0),
                                          0
                                        )}{" "}
                                        KGS
                                      </p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td className="p-2 text-left" colSpan={5}>
                                      <p> TOTAL GROSS WEIGHT:</p>
                                      <p className="ml-8">
                                        {/* {invoiceSubData.reduce(
                                          (total, item) =>
                                            total +
                                            (item.invoiceSub_item_bag || 0),
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
                                </>
                              )}
                            </td>
                            <td className=" p-2 text-center"></td>
                          </tr>
                        </>
                      ))}

                      <tr className="text-[10px]">
                        <td className="border-r border-black p-2">
                          <p className="mt-6"> CONTAINER NO:</p>

                          <span className="font-bold block text-[11px]">
                            (IN {invoicePackingData.invoice_container_size})
                          </span>
                          <span className="font-bold text-[10px]">
                            {/* ( {sumbag} BAGS IN{" "}
                            {invoicePackingData.invoice_container_size}) */}
                            FCL / FCL ONE DOOR OPEN CONTAINER
                          </span>
                        </td>
                        <td className="border-r border-black p-2"></td>
                        <td className="border-r border-black p-2">
                          {" "}
                          <p className="mt-2">COMMERCIAL INVOICE NO.</p>
                          <p className="my-1">
                            {invoicePackingData.invoice_ref}{" "}
                          </p>
                          <p className="my-1">
                            {invoicePackingData.contract_ref}
                          </p>
                          <p> {invoicePackingData.contract_date}</p>
                          <p> {invoicePackingData.invoice_sb_no}</p>
                        </td>
                        <td className="border-r border-black p-2"></td>
                        <td className=" p-2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] p-2">
                  <div className="grid grid-cols-2 mt-5">
                    <div className="flex items-start gap-4">
                      <h2>FREIGHT PREPAID AS ARRANGED.</h2>
                      <h2>BL DATE:{invoicePackingData.invoice_bl_date}</h2>
                    </div>

                    <div className="space-y-3">
                      <h2>FREIGHT CHARGES:</h2>
                      <h2>ARBITARY CHARGES:</h2>
                    </div>
                  </div>
                </div>
              </div>
              <div className="page-break"></div>
            </div>
          </>
        )}
        {/* //INVOICE ONE END  */}
      </div>
    </div>
  );
};

export default BlDraft;
