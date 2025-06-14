import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { getTodayDate } from "@/utils/currentDate";
import { Loader2, Printer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";
import BASE_URL from "@/config/BaseUrl";
import { FaRegFileWord } from "react-icons/fa";
import moment from "moment";
import { decryptId } from "@/utils/encyrption/Encyrption";
import {
  ErrorComponent,
  LoaderComponent,
  WithoutErrorComponent,
  WithoutLoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

const InvoiceTripartite = () => {
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
    link.download = "Tripartite.doc";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };
  if (loading) {
    return <WithoutLoaderComponent name="Invoice Spice Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (error) {
    return (
      <WithoutErrorComponent
        message="Error Fetching Invoice Triparitite  Data"
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
        <div>
          <p className="text-center font-bold text-lg underline decoration-1 underline-offset-2">
            TRIPARTITE AGREEMENT FOR THIRD PARTY EXPORT PAYMENT
          </p>
        </div>

        <div className="mt-6">
          <p className="text-sm">
            This Agreement made amongst, Acting through its Authorized
            Signatory,
          </p>
        </div>

        <div className="mt-3 flex flex-row items-start gap-7 ">
          <p className="text-sm font-bold ">FIRST PARTY : </p>
          <div>
            <p className=" text-sm font-bold">{spiceBoard?.branch_name}</p>
            <p className="text-sm font-bold w-60">
              {spiceBoard?.branch_address}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-center">And</p>
        </div>
        <div className="mt-3 flex flex-row items-start gap-[0.6rem] ">
          <p className="text-sm font-bold ">SECOND PARTY : </p>
          <div>
            <p className=" text-sm font-bold">{spiceBoard?.invoice_buyer}</p>
            <p className="text-sm font-bold w-60">
              {spiceBoard?.invoice_buyer_add}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-center">And</p>
        </div>

        <div className="mt-3 flex flex-row items-start gap-7 ">
          <p className="text-sm font-bold ">THIRD PARTY :</p>
          <p className=" text-sm font-bold">
            <br />
            <br />
            herein after called Third Party
          </p>
        </div>
        <div>
          <p className="text-base font-bold underline decoration-1 underline-offset-2 mt-6">
            DEFINITIONS :
          </p>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              First Party is a Exporter of Argo Products from India and entered
              into sales contract with Second Party (Importer).
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              Second Party is a Importer of Argo Products and agreed to procure
              from First Party as per sales contract entered with First Party
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              Third Party is a Remitter of foreign exchange involved in this
              transactions entered between First Party and Second Party vide
              Sales Contract.
            </span>
          </p>
        </div>

        <div>
          <p className="text-base font-bold underline decoration-1 underline-offset-2 mt-6">
            SCOPE OF TRANSCATIONS :
          </p>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              FIRST PARTY has agreed to procure, process, pack and export
              specified agro product as in the Sales contract entered with
              Second Party and comply all quality and quantity specifications
              prescribed required in the importing country.
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              FIRST PARTY has agreed to ship the goods as per terms and
              conditions of Sales contract entered with Second Party.
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              FIRST PARTY will raise invoice on Second Party asper terms and
              condition of Sales contract entered with Second Party.
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              SECOND PARTY has agreed to import the goods shipped by First Party
              and comply all import regulation of their country.
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              SECOND PARTY has agreed to honour the Bill (Invoice) raised on
              them as per sales contract entered with First Party.
            </span>
          </p>
        </div>

        <div className="mt-5 text-sm flex items-center justify-around ">
          <p className=" flex flex-col text-start ">
            <span>Signature</span>
            <span>(First Party)</span>
            <span>{spiceBoard?.branch_name}</span>
            <span className="mt-5">Witness:</span>
          </p>
          <p className=" flex flex-col text-start">
            <span>Signature</span>
            <span>(Second Party)</span>
            <span>{spiceBoard?.invoice_buyer}</span>
            <span className="mt-5">Witness:</span>
          </p>
          <p className=" flex flex-col text-start">
            <span>Signature</span>
            <span>(Third Party)</span>
            <span> &ensp;</span>
            <span className="mt-5">Witness:</span>
          </p>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              SECOND PARTY has agreed to arrange the BIll amount raised on them
              for payment through Third Party and advice them (Third Party ) to
              remit the Invoice amount directly to First Party as per Bank
              details given by the First Party.
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              SECOND PARTY has agreed to bear all bank charges, interest raised
              in the transaction of remittances made by the Third Party.
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              THIRD PARTY is a remitter of the foreign exchange on behalf of
              Second Party and agreed to remit the amount as advised by Second
              Party time to time through their Banking facility.
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              THIRD PARTY has agreed to remit the amount to First Party through
              the normal Banking channel to the First Party's bank account and
              advise immediately swift message to the Second Party and First
              Party.
            </span>
          </p>
          <p className="text-sm ">
            <span className="px-[7.6rem] inline-block">
              THIRD PARTY will bear all the bank charges and get reimbursed from
              Second Party in due course of time against this transactions.
            </span>
          </p>
        </div>

        <div className="mt-6 text-sm ">
          <p>
            <span className="font-bold underline decoration-1 underline-offset-2">
              VALIDITY OF AGREEMENT :
            </span>{" "}
            &ensp;
            <span>
              All the parties has agreed that the validity of this agreement is
              till cancelled and raise any objections in writing and express
              their concerns amongst them and resolve the issues.
            </span>
          </p>
        </div>

        <div className="mt-6 text-sm">
          <p>
            <span>Date:</span>
            <span> {moment(getTodayDate()).format("DD-MMM-YYYY")}</span>
          </p>
          <p>
            <span>Place:</span>
            <span>Bangalore</span>
          </p>
        </div>

        <div className="mt-10 text-sm flex items-center justify-around ">
          <p className=" flex flex-col text-start ">
            <span>Signature</span>
            <span>(First Party)</span>
            <span>{spiceBoard?.branch_name}</span>
            <span className="mt-10">Witness:</span>
          </p>
          <p className=" flex flex-col text-start">
            <span>Signature</span>
            <span>(Second Party)</span>
            <span>{spiceBoard?.invoice_buyer}</span>
            <span className="mt-10">Witness:</span>
          </p>
          <p className=" flex flex-col text-start">
            <span>Signature</span>
            <span>(Third Party)</span>
            <span> &ensp;</span>
            <span className="mt-10">Witness:</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTripartite;
