import html2pdf from "html2pdf.js";
import { Loader, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
// import logo from "../../../public/v3.png";
// import stamplogo from "../../../public/stamplogo.png";
import Page from "@/app/page/page";
import { Button } from "@/components/ui/button";
import { ButtonConfig } from "@/config/ButtonConfig";
const SalesView = () => {
  const containerRef = useRef();
  const [printloading, setPrintLoading] = useState(false);

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
        font-size: 10px;
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
      filename: "INVOICE.pdf",
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
      .then((pdf) => {})
      .save();
  };

  return (
    <Page>
      <div className="flex justify-end">
        {/* <button
          onClick={handleSaveAsPdf}
          className=" bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 flex items-center"
        >
          <File className="w-4 h-4 mr-2" />
          PDF
        </button> */}

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
      </div>
      <div ref={containerRef} className="font-normal text-[13px]">
        <>
          <div className="p-8 font-normal text-[13px]  mr-[5mm] ml-[5mm]">
            <div className="max-w-3xl mx-auto ">
              <h3 className="text-xl font-bold flex justify-center p-1">
                INVOICE
              </h3>
              <div className="mx-auto border border-black">
                <div className=" border-b border-black">
                  <p className="ml-1">GSTIN: 33BBUPB0222M1ZT</p>
                  <div className="flex flex-col items-center text-center gap-1">
                    <strong className="text-xl  uppercase tracking-widest font-black">
                      PAVANSHREE PLASTIC INDUSTRIES
                    </strong>
                    <p className="text-sm">
                      No. 52A, Therashanagar, Thanthonimalai, Karur - 639005,
                      Tamilnadu
                    </p>
                    <p className="text-sm">
                      No. 53, Therashanagar, Thanthonimalai, Karur - 639005,
                      Tamilnadu
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-b border-black leading-relaxed ">
                  <div className="p-2 font-bold">
                    <span className="underline">To</span>
                    <div className="ml-8">
                      <p className="underline">S S V ROPE & POLYMERS</p>
                      <p className="underline">
                        No. 11/20A, NEAR BHARATH PETROLE
                      </p>
                      <p className="underline">BUNK, RATHINAVAL GOUNDER KADU</p>
                      <p className="underline">
                        ATTAYAMAPATTI, SALEM - 637 501
                      </p>
                      <p className="underline">TAMIL NADU</p>
                    </div>
                  </div>

                  <div className="border-l border-black p-2">
                    <p className="font-bold">
                      INVOICE NO. <span className="underline">00022</span>
                    </p>
                    <p>Party's</p>
                    <p className="font-bold">GSTIN : 33APYPT2612J1ZF</p>
                    <p className="font-bold">Date : 31-05-2025</p>
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
                          Mob: 9385612264
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
                          Vehicle No. TN78-MA4891
                        </strong>{" "}
                      </div>
                    </div>
                    <div className=" w-full px-1 ">
                      <div className="w-full">
                        <h3>Document Thru</h3>
                        <p className="min-h-4"></p>
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
                        <th className="border-r border-b border-black px-2  py-1 text-center w-[16%]">
                          Quantity
                        </th>
                        <th
                          colSpan="2"
                          className="border-r border-b border-black px-2 py-1 text-center w-[17%]"
                        >
                          Rate Kgs/Mt
                        </th>
                        <th
                          className="px-2 py-0.5 border-b border-black text-center w-[17%]"
                          colSpan="2"
                        >
                          Amount
                        </th>
                      </tr>
                      <tr className="border-b border-black">
                        <th className="border-r border-black px-2 py-1 text-center">
                          Kgs/Mts
                        </th>
                        <th className="border-r border-black px-2 py-1 text-center">
                          Rs.
                        </th>
                        <th className="border-r border-black px-2 py-1 text-center">
                          Ps
                        </th>

                        <th className="border-r border-black px-2 py-1 text-center">
                          Rs.
                        </th>
                        <th className=" px-2 py-1 text-center">Ps</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-r border-black p-1 text-center">
                          1
                        </td>
                        <td className="border-r border-black p-1 font-semibold">
                          <p>HDPE REPROCESSED </p>
                          <p>MONOFILAMENT YARN</p>
                          <p>2nd Quality 'B'</p>
                          <p>Grade HSN Code: 5404</p>
                        </td>
                        <td className="border-r border-black p-1 text-center font-semibold">
                          250
                        </td>
                        <td className="border-r border-black p-1 text-end font-semibold">
                          80
                        </td>
                        <td className="p-1 text-end border-r border-black">
                          00
                        </td>
                        <td className="p-1 text-center border-r border-black">
                          20000
                        </td>
                        <td className="p-1 text-end font-semibold">00</td>
                      </tr>

                      <tr className="border-b border-black">
                        <td className="border-r border-black p-1 text-left"></td>
                        <td className="border-r text-end border-black p-1 font-bold"></td>
                        <td className="border-r border-black p-1 text-center"></td>
                        <td className="border-r border-black p-1 text-end ">
                          {" "}
                          <p> Sub Total</p>
                          <p>
                            ICGST <span className="font-semibold">12%</span>
                          </p>
                          <p>
                            CGST <span className="font-semibold">6%</span>
                          </p>
                          <p>
                            SGST <span className="font-semibold">6% </span>
                          </p>
                        </td>
                        <td className="border-r text-end border-black p-1 font-bold"></td>
                        <td className="border-r  border-black p-1 font-bold text-right">
                          {" "}
                          <p> 20,000 00</p>
                          <p></p>
                          <p>1,200 00</p>
                          <p>1,200 00</p>
                        </td>{" "}
                        <td className=" text-end  p-1 font-bold">
                          <p> 00</p>
                          <p></p>
                          <p>00</p>
                          <p>00</p>
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
                        <td className="border-r border-black p-2 text-end font-semibold">
                          1,267.400 KG
                        </td>
                        <td className=" text-end  p-2 font-bold">00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* //fifth */}
                <div className=" mb-1 mt-3">
                  <div className="flex justify-between"></div>
                  <h2 className="font-bold px-1 text-sm underline">
                    {" "}
                    Rupees Twenty Two Thousand Four Hundred Only
                  </h2>
                </div>
                <div className=" mb-1">
                  <div className="flex justify-end">
                    <h2 className="px-1 text-sm ">
                      {" "}
                      For PAVANSHREE PLASTIC INDUSTRIES
                    </h2>
                  </div>

                  <div className="min-h-6"> </div>
                  <div className="grid grid-cols-3">
                    <p></p>
                    <p></p>
                    <p className="text-center">Manager</p>
                  </div>
                  <div className="min-h-6"> </div>

                  <div className="px-1">
                    <p>Party Signature</p>
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
