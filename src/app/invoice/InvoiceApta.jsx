import BASE_URL from "@/config/BaseUrl";
import { getTodayDate } from "@/utils/currentDate";
import { Loader2, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { FaRegFileWord } from "react-icons/fa";
import { decryptId } from "@/utils/encyrption/Encyrption";
import {
  LoaderComponent,
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
const InvoiceApta = () => {
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
    link.download = "apta.doc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return <WithoutLoaderComponent name="Invoive Apta Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (error) {
    return (
      <WithoutErrorComponent
        message="Error Fetching Invoive Apta Data"
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

      <div ref={containerRef} className="max-w-4xl mx-auto p-6 bg-white  ">
        <div className="mb-4 mt-5 ">
          <p className=" text-left text-[13px] ">{spiceBoard?.branch_name}</p>
          <p className=" text-left text-[13px]  w-60 ">
            {spiceBoard?.branch_address}
            <br />
          </p>
        </div>
        <div className="mt-14 ">
          <p className=" text-left text-[13px] ">
            {spiceBoard?.invoice_consignee}
          </p>
          <p className="text-left text-[13px] w-60">
            {" "}
            {spiceBoard?.invoice_consignee_add}
          </p>
        </div>
        <div className="mt-14 ">
          <p className=" text-left text-[13px] ">
            {spiceBoard?.invoice_prereceipts} To {spiceBoard?.invoice_loading},
            INDIA BY {spiceBoard?.invoice_precarriage} <br />
            {spiceBoard?.invoice_loading}, INDIA To{" "}
            {spiceBoard?.invoice_destination_port} /{" "}
            {spiceBoard?.invoice_destination_country} BY SEA
          </p>
        </div>
        <div className="overflow-x-auto mt-14 ">
          <table className="w-full bg-white  text-[12px] table-fixed">
            <tbody className="">
              {invoiceSubData?.map((item, index) => (
                <tr key={item.id}>
                  <td className=" w-[15%] text-[12px]  p-2 text-sm text-gray-900 break-words">
                    {/* {sub.contractSub_marking} */}
                    {item.InvoiceSubs.item_hsn}
                  </td>
                  <td className=" w-[15%] text-[12px] p-2 text-sm text-gray-900 break-words">
                    {/* {sub.contractSub_marking} */}
                    {item.invoiceSub_marking}
                    <br />
                    {item.invoiceSub_item_bag} {item.invoiceSub_sbaga}
                  </td>
                  <td className=" w-[30%] text-[12px]  p-2 text-sm text-gray-900 break-words">
                    {/* {sub.contractSub_descriptionofGoods} */}
                    {item.invoiceSub_descriptionofGoods}
                    <br />
                    PACKED {item.invoiceSub_packing} KGS NET IN EACH{" "}
                    {item.invoiceSub_sbaga}
                  </td>
                  <td className=" w-[10%] text-[12px]  p-2 text-sm text-gray-900 break-words">
                    A
                  </td>
                  <td className=" w-[15%] text-[12px]  p-2 text-sm text-gray-900 break-words">
                    Gross Weight
                    <br />
                    {invoiceSubData
                      ?.reduce(
                        (total, currItem) =>
                          total +
                          (parseFloat(currItem?.invoiceSub_qntyInMt) || 0),
                        0
                      )
                      .toFixed(2)}{" "}
                    KGS
                  </td>
                  {index == 0 && (
                    <td className="w-[15%] text-[12px] p-2 text-sm text-gray-900 break-words">
                      {spiceBoard?.invoice_ref}
                      <br />
                      DT.{moment(spiceBoard?.invoice_date).format("DD-MM-YYYY")}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className=" mt-80 flex  flex-col items-start gap-10">
          <p className=" text-left text-[13px] ">INDIA</p>
          <p className=" text-left text-[13px] ">
            {spiceBoard?.invoice_destination_country}
          </p>
        </div>
        <div className="mt-8  ">
          <p className=" text-left text-[13px] ">BANGALORE</p>
          <p className=" text-left text-[13px] ">
            {moment(getTodayDate()).format("DD-MMM-YYYY")}
          </p>
        </div>
        <div className="mt-16  ">
          <p className=" text-center text-[13px] ">
            ( {spiceBoardBranch.branch_sign_name1})
          </p>
        </div>
        <div className="mt-48 ">
          <p className=" text-left text-[13px] ">
            AS SHOWN IN COLUMN NO. 1. GOODS NOT YET SHIPPED
          </p>
        </div>
        <div className="mt-24 ">
          <p className=" text-left text-[13px] ">
            GOODS WHOLLY OBTAINED IN INDIA. NO IMPORTED MATERIALS USED
          </p>
        </div>
        <div className="mt-16  ">
          <p className=" text-left text-[13px] ">
            INVOICE NO. 03-Feb-25 AE2024252138 Dtd. : 02-12-2024
          </p>
          <p className=" text-left text-[13px] ">
            CIF VALUE IN USD $ 26,400.00
          </p>
          <p className=" text-left text-[13px] ">REG. NO. 151015</p>
        </div>
        <div className="mt-16  flex flex-col items-end mr-20  gap-10 ">
          <p className=" pr-20  text-[13px] ">
            ({spiceBoardBranch.branch_sign_name1})
          </p>
          <p className="  text-[13px] ">BANGALORE DTD. INVOICE NO. 03-Feb-25</p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceApta;
