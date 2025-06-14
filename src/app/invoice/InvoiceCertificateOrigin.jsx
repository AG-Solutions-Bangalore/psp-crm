import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { getTodayDate } from "@/utils/currentDate";
import { Loader2, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import BASE_URL from "@/config/BaseUrl";
import moment from "moment";

import { FaRegFileWord } from "react-icons/fa";
import { decryptId } from "@/utils/encyrption/Encyrption";
import {
  ErrorComponent,
  LoaderComponent,
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
const InvoiceCertificateOrigin = () => {
  const containerRef = useRef();

  const { id } = useParams();
  const decryptedId = decryptId(id);

  const [spiceBoard, setSpiceBoard] = useState(null);
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
    link.download = "Certificate_of_Origin.doc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  if (loading) {
    return <WithoutLoaderComponent name="Certificate Origin  Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (error) {
    return (
      <WithoutErrorComponent
        message="Error Fetching Certificate Origin  Data"
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
          <p className=" text-left text-[13px] w-60 ">
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

        <div className="mt-20 ml-5 flex items-center flex-row  gap-32 ">
          <p className="  text-[13px] ">ROAD</p>
          <p className="  text-[13px] ">{spiceBoard?.invoice_prereceipts}</p>
        </div>

        <div className="mt-2 ml-5 flex items-center flex-row  gap-[7.6rem] ">
          <p className="  text-[13px] ">BY SEA</p>
          <p className="   text-[13px] ">
            {spiceBoard?.invoice_loading}, INDIA
          </p>
        </div>
        <div className="mt-2 ml-5 flex items-center flex-row  gap-[5.7rem] ">
          <p className="  text-[13px] ">
            {" "}
            {spiceBoard?.invoice_destination_port}
          </p>
          <p className="  text-[13px] ">SINGAPORE</p>
        </div>
        <div className="overflow-x-auto mt-14 ">
          <table className="w-full bg-white  text-[12px] table-fixed">
            <tbody className="divide-y divide-gray-200">
              {invoiceSubData?.map((item, index) => (
                <tr key={item.id}>
                  <td className=" w-[15%] text-[12px] p-2 text-sm text-gray-900 break-words">
                    {item.invoiceSub_marking}
                  </td>
                  <td className=" w-[15%] text-[12px]  p-2 text-sm text-gray-900 break-words">
                    {item.invoiceSub_item_bag} {item.invoiceSub_sbaga}
                  </td>
                  <td className=" w-[40%] text-[12px]  p-2 text-sm text-gray-900 break-words">
                    {/* {sub.contractSub_descriptionofGoods} */}
                    {item.invoiceSub_descriptionofGoods}
                    <br />
                    PACKED {item.invoiceSub_packing} KGS NET IN EACH{" "}
                    {item.invoiceSub_sbaga}
                  </td>

                  <td className=" w-[15%] text-[12px]  p-2 text-sm text-gray-900 break-words">
                    {invoiceSubData
                      ?.reduce(
                        (total, currItem) =>
                          total +
                          (parseFloat(currItem?.invoiceSub_qntyInMt) || 0),
                        0
                      )
                      .toFixed(2)}{" "}
                    MT
                  </td>

                  {index == 0 && (
                    <td className="w-[15%] text-[12px] p-2 text-sm text-gray-900 break-words">
                      {spiceBoard?.invoice_ref}
                      <br />
                      DT.{moment(spiceBoard?.invoice_date).format("DD-MM-YYYY")}
                      <br />$
                      {invoiceSubData
                        ?.reduce(
                          (total, item) =>
                            total +
                            (parseFloat(item?.invoiceSub_qntyInMt) || 0) *
                              (parseFloat(item?.invoiceSub_rateMT) || 0),
                          0
                        )
                        .toFixed(2)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className=" mt-80 flex  flex-col items-start gap-10">
          <p className=" text-left text-[13px] ">
            ({spiceBoard?.invoice_container_size} (
            {invoiceSubData?.reduce(
              (total, currItem) =>
                total + (parseFloat(currItem?.invoiceSub_item_bag) || 0),
              0
            )}{" "}
            BAGS IN {spiceBoard?.invoice_container_size})
          </p>
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
      </div>
    </div>
  );
};

export default InvoiceCertificateOrigin;
