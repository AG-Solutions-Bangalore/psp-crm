import { SALES_LIST } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import Page from "@/app/page/page";
import { LoaderComponent } from "@/components/LoaderComponent/LoaderComponent";
import { Button } from "@/components/ui/button";
import { ButtonConfig } from "@/config/ButtonConfig";
import { decryptId } from "@/utils/encyrption/Encyrption";
import html2pdf from "html2pdf.js";
import { ArrowDownToLine, Loader, Printer } from "lucide-react";
import { toWords } from "number-to-words";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const SalesView = () => {
  const { id } = useParams();
  let decryptedId = null;
  const isEdit = Boolean(id);

  if (isEdit) {
    try {
      const rawId = decodeURIComponent(id);
      decryptedId = decryptId(rawId);
    } catch (err) {
      console.error("Failed to decrypt ID:", err.message);
    }
  }
  const containerRef = useRef();
  const [printloading, setPrintLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const token = usetoken();
  const [isLoading, setIsLoading] = useState(false);
  const companyname = useSelector((state) => state.auth.companyname);
  const gst = useSelector((state) => state.auth.company_gst);
  const address = useSelector((state) => state.auth.company_address);
  const statename = useSelector((state) => state.auth.company_state_name);
  useEffect(() => {
    const fetchRawMaterialById = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`${SALES_LIST}/${decryptedId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const raw = response?.data;

        if (raw) {
          setFormData(raw?.data);
        }
      } catch (error) {
        console.error("Failed to fetch raw material by ID:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && token) {
      fetchRawMaterialById();
    }
  }, [id, token]);
  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "INVOICE",
    pageStyle: `
    @page {
      size: A4 portrait;
    margin: 5mm;
    }
    @media print {
      body {
        font-size: 13px;
        margin: 0mm;
        padding: 0mm;
      }
      table {
        font-size: 11px;
      }
      .print-hide {
        display: none;
      }
    }
  `,
    onBeforeGetContent: () => {
      setPrintLoading(true);
    },
    onAfterPrint: () => {
      setPrintLoading(false);
    },
    onPrintError: () => {
      setPrintLoading(false);
    },
  });

  const handleSaveAsPdf = () => {
    if (!containerRef.current) {
      console.error("Element not found");
      return;
    }

    setLoading(true);

    html2pdf()
      .from(containerRef.current)
      .set({
        margin: 10,
        filename: "Invoice.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save()
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.error("PDF generation error:", err);
        setLoading(false);
      });
  };

  let quantityInWords = "";
  const totalAmount = Number(formData?.sales_total_amount);

  if (!isNaN(totalAmount)) {
    const [whole, decimal = "00"] = totalAmount.toFixed(2).split(".");

    const rupeesInWords = toWords(Number(whole)).toUpperCase();
    const paiseInWords = toWords(Number(decimal)).toLowerCase();

    quantityInWords = `${rupeesInWords} Rupees ${paiseInWords} paise`;
  }
  if (isLoading) {
    return <LoaderComponent name="Sales" />;
  }
  return (
    <Page>
      <div className="flex justify-end space-x-2">
        <Button
          className={`mt-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} `}
          onClick={handlePrintPdf}
        >
          {printloading ? (
            <Loader className="animate-spin h-3 w-3" />
          ) : (
            <Printer className="h-3 w-3" />
          )}{" "}
          Print
        </Button>
        <Button
          className={`mt-2 ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor} `}
          onClick={handleSaveAsPdf}
        >
          {loading ? (
            <Loader className="animate-spin h-3 w-3" />
          ) : (
            <ArrowDownToLine className="h-3 w-3" />
          )}{" "}
          PDF
        </Button>
      </div>
      <div ref={containerRef} className="font-normal text-[13px]">
        <>
          <div className="font-normal text-[13px] print:p-8">
            <div className="max-w-3xl mx-auto ">
              <h3 className="text-xl font-bold flex justify-center px-1 mb-2">
                INVOICE
              </h3>
              <div className="mx-auto border border-black">
                <div className=" border-b border-black">
                  <p className="ml-1">GSTIN: {gst || ""}</p>
                  <div className="flex flex-col items-center text-center gap-1">
                    <strong className="text-xl  uppercase tracking-widest font-black">
                      {companyname || ""}
                    </strong>
                    <p className="text-sm mb-2">{address || ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-black leading-relaxed ">
                  <div className="p-2 font-bold">
                    <span className="underline">To</span>
                    <div className="ml-8">
                      <p className="underline uppercase">
                        {formData?.vendor_name}
                      </p>
                      <p className="underline uppercase">
                        {formData?.vendor_address || ""}
                      </p>

                      <p className="underline">{formData?.vendor_state_name}</p>
                    </div>
                  </div>

                  <div className="border-l border-black p-2">
                    <p className="font-bold">
                      INVOICE NO.{" "}
                      <span className="underline">
                        {" "}
                        {formData?.sales_no || ""}
                      </span>
                    </p>
                    <p>Party's</p>
                    <p className="font-bold">
                      GSTIN : {formData?.vendor_gst || ""}
                    </p>
                    <p className="font-bold">
                      Date : {formData?.sales_date || ""}
                    </p>
                    <p>Time of Sale :</p>
                    <p>RR/LR</p>
                  </div>
                </div>

                {/* //second */}
                <div className="grid grid-cols-2">
                  <div className="">
                    <div>
                      <p className="leading-relaxed px-1 m-1">
                        <p>Order Confirmation No. </p>
                        <strong className="ml-10 underline">
                          Mob: {formData?.vendor_contact_mobile || ""}
                        </strong>{" "}
                        <br />
                        Date :
                      </p>
                    </div>
                  </div>

                  <div className="grid   border-l border-black">
                    <div className=" w-full px-1 ">
                      <div className="w-full">
                        <h3>Despatched Thru</h3>
                        <strong className="underline">
                          {formData?.sales_dispatched}
                        </strong>{" "}
                      </div>
                    </div>
                    <div className=" w-full px-1 ">
                      <div className="w-full">
                        <h3>Document Thru</h3>
                        <p className="min-h-4"> {formData?.sales_document}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* //thired */}
                <div>
                  <table className="w-full border-t border-black ">
                    <thead className="leading-tight">
                      {" "}
                      <tr>
                        <th
                          className="border-r border-black px-2 py-0.5 text-center w-[5%]"
                          rowSpan={2}
                        >
                          Sl No.
                        </th>
                        <th
                          className="border-r border-black px-2  py-0.5 text-center"
                          rowSpan={2}
                        >
                          Particulars
                        </th>
                        <th className="border-r border-b border-black p-2 text-center w-[16%] ">
                          Quantity
                        </th>
                        <th
                          colSpan="2"
                          className="border-r border-b border-black px-2 py-1 text-center w-[17%]"
                        >
                          Rate Kgs/Mt
                        </th>
                        <th
                          className="p-2 p border-b border-black text-center w-[17%]"
                          colSpan="2"
                        >
                          Amount
                        </th>
                      </tr>
                      <tr className="border-b border-black">
                        <th className="border-r border-black p-2  text-center">
                          Kgs/Mts
                        </th>
                        <th
                          className="border-r border-black p-2  text-center"
                          colSpan="2"
                        >
                          Rs.
                        </th>

                        <th className=" p-2  text-center" colSpan="2">
                          Rs.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-r border-black p-1 text-center">
                          1
                        </td>
                        <td className="border-r border-black p-1 font-semibold">
                          {formData?.sales_description}
                        </td>
                        <td className="border-r border-black p-1 text-center font-semibold">
                          {formData?.sales_quantity}
                        </td>
                        <td
                          className="border-r border-black p-1 text-end font-semibold"
                          colSpan={2}
                        >
                          {formData?.sales_rate || "0"}
                        </td>
                        <td className="p-1 text-center" colSpan={2}>
                          {formData?.sales_amount || "0"}{" "}
                        </td>
                      </tr>

                      <tr className="border-b border-black">
                        <td className="border-r border-black p-1 text-left"></td>
                        <td className="border-r border-black p-1 text-center"></td>
                        <td
                          className="border-r  border-black  p-1 font-bold"
                          colSpan={2}
                        />
                        <td className="border-r border-black p-1 text-end ">
                          {" "}
                          <p> Sub Total</p>
                          <p>
                            CGST{" "}
                            <span className="font-semibold">
                              {statename === formData?.vendor_state_name
                                ? `${formData?.sales_cgst} % `
                                : "0%"}
                            </span>
                          </p>
                          <p>
                            SGST{" "}
                            <span className="font-semibold">
                              {statename === formData?.vendor_state_name
                                ? `${formData?.sales_sgst} % `
                                : "0%"}
                            </span>
                          </p>
                          <p>
                            ICGST{" "}
                            <span className="font-semibold">
                              {statename == formData?.vendor_state_name
                                ? "0%"
                                : `${formData?.sales_igst} % `}
                            </span>
                          </p>
                        </td>
                        <td className="p-1 font-bold text-right" colSpan={2}>
                          {" "}
                          <p>{formData?.sales_amount || "0"}</p>
                          <p>
                            {statename === formData?.vendor_state_name
                              ? `${(
                                  (Number(formData?.sales_amount || 0) *
                                    Number(formData?.sales_cgst || 0)) /
                                  100
                                ).toFixed(2)}`
                              : "0"}
                          </p>
                          <p>
                            {" "}
                            {statename === formData?.vendor_state_name
                              ? `${(
                                  (Number(formData?.sales_amount || 0) *
                                    Number(formData?.sales_sgst || 0)) /
                                  100
                                ).toFixed(2)}`
                              : "0"}
                          </p>
                          <p>
                            {statename == formData?.vendor_state_name
                              ? "0"
                              : `${(
                                  (Number(formData?.sales_amount || 0) *
                                    Number(formData?.sales_igst || 0)) /
                                  100
                                ).toFixed(2)}`}
                          </p>
                        </td>{" "}
                      </tr>
                      <tr className="border-b border-black">
                        <td
                          className="border-r text-start border-black p-2 font-bold"
                          colSpan={2}
                        >
                          E. & O.E.
                        </td>
                        <td
                          className="border-r border-black p-2 text-start font-bold"
                          colSpan={3}
                        >
                          Grand Total
                        </td>
                        <td className="px-1 text-end font-semibold">
                          {formData?.sales_total_amount}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* //fifth */}
                <div className=" mb-1 mt-3">
                  <div className="flex justify-between"></div>
                  <h2 className="font-bold px-1 text-sm underline">
                    {" "}
                    {quantityInWords ? quantityInWords.toUpperCase() : ""}
                  </h2>
                </div>
                <div className=" mb-1">
                  <div className="flex justify-end">
                    <h2 className="px-1 text-sm ">
                      {" "}
                      For {companyname.toUpperCase() || ""}
                    </h2>
                  </div>

                  <div className="min-h-6"> </div>

                  <div className="min-h-6"> </div>

                  <div className="grid grid-cols-3 mb-2">
                    <p className="px-1">Party Signature</p>
                    <p></p>
                    <p className="text-center">Manager</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="page-break"></div>
          </div>
        </>
      </div>
    </Page>
  );
};

export default SalesView;
