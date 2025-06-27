import html2pdf from "html2pdf.js";
import { Loader, Printer } from "lucide-react";
import { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
// import logo from "../../../public/v3.png";
// import stamplogo from "../../../public/stamplogo.png";
import Page from "@/app/page/page";
import { Button } from "@/components/ui/button";
import { ButtonConfig } from "@/config/ButtonConfig";
const TaxInvoice = () => {
  const containerRef = useRef();
  const [printloading, setPrintLoading] = useState(false);

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "TAX_INVOICE",
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
      filename: "TAX INVOICE.pdf",
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
      <div ref={containerRef} className="font-normal text-[11px]">
        <>
          <div className="p-4 font-normal text-[11px]">
            <div className="max-w-4xl mx-auto ">
              <h3 className="  text-xl font-bold flex justify-center p-1">
                TAX INVOICE
              </h3>
              <div className="mx-auto border border-black">
                <div className="grid grid-cols-2 border-b border-black">
                  <div className=" text-[11px] leading-relaxed m-1">
                    <p>
                      <strong>GOLDEN KNITTS</strong> <br />
                      253 RAJA NAGAR,RAMANOOR
                      <br />
                      PASUPATHIPALAYAM POST
                      <br />
                      KARUR-639004
                      <br />
                      <strong>GSTIN/UIN:</strong> 33AIAPG9190M1Z1 <br />
                      <strong>State Name:</strong> Tamil Nadu,,{" "}
                      <strong>Code:</strong> 33
                      <br />
                      <strong>Email:</strong> : goldenknitts1983@gmail.com
                    </p>
                  </div>

                  <div className="grid  text-[11px]">
                    <div className="grid grid-cols-2 border-b border-l border-black w-full px-1">
                      <div className="w-full border-r border-black">
                        <div className="flex justify-between">
                          <h3>Invoice No.</h3>
                          <h3>e-Way Bill No..</h3>
                        </div>
                        <div className="flex justify-between">
                          <p className="font-semibold text-black">301</p>
                        </div>
                      </div>
                      <div className="w-full px-1">
                        <h3>Dated</h3>
                        <p className="font-semibold text-black">5-Aug-24</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 border-b border-l border-black w-full px-1">
                      <div className="w-full border-r border-black">
                        <h3>Delivery Note</h3>
                        <p>Dummy</p>
                      </div>
                      <div className="w-full px-1">
                        <h3>Mode/Terms of Payment</h3>
                        <p>Dummy</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 w-full px-1 border-l border-black">
                      <div className="w-full border-r border-black">
                        <h3>Supplier's Ref.</h3>
                        <p>Dummy</p>
                      </div>
                      <div className="w-full px-1">
                        <h3>Other References</h3>
                        <p>Dummy</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* //second */}
                <div className="grid grid-cols-2">
                  <div className="">
                    <div className=" text-[11px] ">
                      <p className="leading-relaxed px-1 m-1">
                        <p>Buyer</p>
                        <strong>PAVANSHREE PLASTIC INDUSTRIES</strong> <br />
                        NO 53,
                        <br />
                        THERASH NAGAR <br />
                        KOLANDANUR
                        <br />
                        KARUR
                        <br />
                        <p>GSTIN/UIN: 33BBUPB0222M1ZT </p>
                        <p>State Name:Tamil Nadu,Code: 33 </p>
                      </p>
                    </div>
                  </div>

                  <div className="grid  text-[11px]">
                    <div className="grid grid-cols-2 border-b border-l border-black w-full px-1">
                      <div className="w-full border-r border-black">
                        <h3>Buyer's Order No.</h3>
                        <p className="font-semibold text-black">Dummy</p>
                      </div>
                      <div className="w-full px-1">
                        <h3>Dated</h3>
                        <p className="font-semibold text-black">5-Aug-24</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 border-b border-l border-black w-full px-1">
                      <div className="w-full border-r border-black">
                        <h3> Despatch Document No.</h3>
                        <p>Dummy</p>
                      </div>
                      <div className="w-full px-1">
                        <h3>Delivery Note Date</h3>
                        <p>Dummy</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 w-full px-1 border-l border-b  border-black">
                      <div className="w-full border-r border-black">
                        <h3>Despatched through</h3>
                        <p>dummy</p>
                      </div>
                      <div className="w-full px-1">
                        <h3>Destination</h3>
                        <p>Dummy</p>
                      </div>
                    </div>
                    <div className=" w-full px-1 border-l border-black">
                      <div className="w-full">
                        <h3>Terms of Delivery</h3>
                        <p className="min-h-12">JAGAESH</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* //thired */}
                <div>
                  <table className="w-full border-t border-black text-[11px]">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="w-[5%] border-r border-black p-1 text-center">
                          S. No
                        </th>
                        <th className="w-[33%] border-r border-black p-1 text-center">
                          Description of Service
                        </th>
                        <th className="w-[10%] border-r border-black p-1 text-center">
                          HSN/SAC
                        </th>
                        <th className="w-[15%] border-r border-black p-1 text-center">
                          Quantity
                        </th>
                        <th className="w-[10%] border-r border-black p-1 text-center">
                          Rate
                        </th>
                        <th className="w-[5%] border-r border-black p-1 text-center">
                          Per
                        </th>
                        <th className="w-[15%] p-1 text-center">Amount</th>
                      </tr>
                    </thead>

                    <tbody className="text-[12px]">
                      <tr>
                        <td className="border-r border-black p-1 text-center">
                          1
                        </td>
                        <td
                          className="border-r border-black p-1 "
                          style={{ lineHeight: "1" }}
                        >
                          <span className="font-bold"> FABRIC WASTE</span>

                          <p className="ml-4 mt-1"> FILAMENTS</p>
                        </td>
                        <td className="border-r border-black p-1 text-center font-semibold">
                          5007
                        </td>
                        <td className="border-r border-black p-1 text-end font-semibold">
                          1,191.900 KG
                        </td>
                        <td className="p-1 text-end border-r border-black">
                          75.00
                        </td>
                        <td className="p-1 text-center border-r border-black">
                          KG
                        </td>
                        <td className="p-1 text-end font-semibold">
                          89,392.50
                        </td>
                      </tr>
                      <tr>
                        <td className="border-r border-black p-1 text-center">
                          2
                        </td>

                        <td
                          className="border-r border-black p-1 "
                          style={{ lineHeight: "1" }}
                        >
                          <span className="font-bold"> FABRIC WASTE</span>

                          <p className="ml-4 mt-1"> RIYA-FILAMENT </p>
                        </td>
                        <td className="border-r border-black p-1 text-center font-semibold">
                          5007
                        </td>
                        <td className="border-r border-black p-1 text-end font-semibold">
                          75.500 KG
                        </td>
                        <td className="p-1 text-end border-r border-black ">
                          75.00
                        </td>
                        <td className="p-1 text-center border-r border-black">
                          KG
                        </td>
                        <td className="p-1 text-end font-semibold">5,662.50</td>
                      </tr>
                      <tr>
                        <td className="border-r border-black p-1 text-center">
                          3
                        </td>

                        <td
                          className="border-r border-black p-1 "
                          style={{ lineHeight: "1" }}
                        >
                          <span className="font-bold"> FABRIC WASTE</span>

                          <p className="ml-4 mt-1"> RIYA-FILAMENT </p>
                        </td>
                        <td className="border-r border-black p-1 text-center font-semibold">
                          5007
                        </td>
                        <td className="border-r border-black p-1 text-end font-semibold">
                          75.500 KG
                        </td>
                        <td className="p-1 text-end border-r border-black ">
                          75.00
                        </td>
                        <td className="p-1 text-center border-r border-black">
                          KG
                        </td>
                        <td className="p-1 text-end font-semibold">5,662.50</td>
                      </tr>

                      <tr>
                        <td className="p-1 text-end border-r border-black" />
                        <td className="p-1 text-end border-r border-black" />
                        <td className="p-1 text-end border-r border-black" />
                        <td className="p-1 text-end border-r border-black" />
                        <td className="p-1 text-end border-r border-black" />
                        <td className="p-1 text-end border-r border-black" />

                        <td className="p-1 text-end border-t border-black">
                          95,055.00
                        </td>
                      </tr>

                      <tr className="border-b border-black">
                        <td className="border-r border-black p-1 text-left"></td>
                        <td className="border-r text-end border-black p-1 font-bold">
                          <p></p>
                          <p>CGST</p>
                          <p>SGST</p>
                          <p>ROUND OFF</p>
                        </td>
                        <td className="border-r border-black p-1 text-center"></td>
                        <td className="border-r border-black p-1 text-end font-semibold"></td>
                        <td className="border-r text-end border-black p-1 font-bold">
                          {/* <p>9</p>
                        <p> 9</p> */}
                        </td>
                        <td className="border-r text-left border-black p-1 font-bold">
                          {/* <p>%</p>
                        <p>%</p> */}
                        </td>{" "}
                        <td className=" text-end  p-1 font-bold">
                          <p>2,376.37</p>
                          <p>2,376.37</p>
                          <p>0.26</p>
                        </td>{" "}
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-b border-black">
                        <td className="border-r border-black p-2 text-left"></td>
                        <td className="border-r text-end border-black p-2 font-bold">
                          Total
                        </td>
                        <td className="border-r border-black p-2 text-center"></td>
                        <td className="border-r border-black p-2 text-end font-semibold">
                          1,267.400 KG
                        </td>
                        <td className="border-r text-end border-black p-2 font-bold"></td>
                        <td className="border-r text-left border-black p-2 font-bold"></td>{" "}
                        <td className=" text-end  p-2 font-bold ">
                          ₹ 99,808.00
                        </td>{" "}
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* //fifth */}
                <div className="text-[11px] mb-1">
                  <div className="flex justify-between">
                    <h2 className="items-start px-1">
                      Amount Chargeable (in words)
                    </h2>
                    <h2 className="items-end px-1">E. & O.E</h2>
                  </div>
                  <h2 className="font-bold px-1 text-sm">
                    {" "}
                    INR Ninety Nine Thousand Eight Hundred Eight Only
                  </h2>
                </div>
                {/* sixth */}

                <table className="w-full border-y border-black text-[11px]">
                  <thead className="leading-tight">
                    {" "}
                    <tr>
                      <th
                        className="border-r border-black px-2 py-0.5 text-center"
                        rowSpan={2}
                      >
                        HSN/SAC
                      </th>
                      <th
                        className="border-r border-black px-2  py-0.5 text-center"
                        rowSpan={2}
                      >
                        Taxable Value
                      </th>
                      <th
                        colSpan="2"
                        className="border-r border-b border-black px-2  py-1 text-center"
                      >
                        Central Tax
                      </th>
                      <th
                        colSpan="2"
                        className="border-r border-b border-black px-2 py-1 text-center"
                      >
                        State Tax
                      </th>
                      <th className="px-2 py-0.5 text-center" rowSpan={2}>
                        Total Tax Amount
                      </th>
                    </tr>
                    <tr className="border-b border-black">
                      <th className="border-r border-black px-2 py-1 text-center">
                        Rate
                      </th>
                      <th className="border-r border-black px-2 py-1 text-center">
                        Amount
                      </th>
                      <th className="border-r border-black px-2 py-1 text-center">
                        Rate
                      </th>
                      <th className="border-r border-black px-2 py-1 text-center">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody className="leading-tight text-[11px]">
                    <tr className="border-b border-black">
                      <td className="border-r border-black px-2 py-1 text-center">
                        5007
                      </td>
                      <td className="border-r border-black px-2 py-1 text-center">
                        95,055.00
                      </td>
                      <td className="border-r border-black px-2 py-1 text-center">
                        2.50%
                      </td>
                      <td className="border-r border-black px-2 py-1 text-center">
                        2,376.37
                      </td>

                      <td className="border-r border-black px-2 py-1 text-center">
                        2.50%
                      </td>
                      <td className="border-r border-black px-2 py-1 text-center">
                        2,376.37
                      </td>
                      <td className="px-2 py-1 text-center">4,752.74</td>
                    </tr>

                    <tr className="border-t border-black font-semibold leading-tight text-[11px]">
                      <td className="border-r border-black px-2 py-1 text-center">
                        Total
                      </td>
                      <td className="border-r border-black px-2 py-1 text-center">
                        95,055.00
                      </td>
                      <td className="border-r border-black px-2 py-1 text-center"></td>
                      <td className="border-r border-black px-2 py-1 text-center">
                        2,376.37
                      </td>
                      <td className="border-r border-black px-2 py-1 text-center"></td>
                      <td className="border-r border-black px-2 py-1 text-center">
                        2,376.37
                      </td>
                      <td className="px-2 py-1 text-center">4,752.74</td>
                    </tr>
                  </tbody>
                </table>

                {/* //seven */}
                <div className="text-[11px] px-1 ">
                  <p>
                    {" "}
                    Tax Amount (in words) :{" "}
                    <span className="font-bold">
                      INR Four Thousand Seven Hundred Fifty Two and Seventy Four
                      paise Only
                    </span>
                  </p>
                  {/* exight */}
                  <div className="grid grid-cols-2">
                    <div className="flex item items-end"></div>
                    <div className="mb-1">
                      Company's Bank Details
                      <p>
                        {" "}
                        Bank Name:{" "}
                        <span className="font-bold">HDFC BANK-4428</span>
                      </p>
                      <p>
                        {" "}
                        A/c No: <span className="font-bold"> HDFC0003758</span>
                      </p>
                      <p>
                        {" "}
                        Branch & IFS Code:{" "}
                        <span className="font-bold"> 50200012354428 </span>
                      </p>
                    </div>
                  </div>
                </div>
                {/* //eight */}
                <div className="grid grid-cols-2">
                  <div>
                    <div className="px-1 mb-1">
                      <p className="underline">Declaration</p>

                      <p>
                        We declare that this invoice shows the actual price of
                        the goods described and that all particulars are true
                        and correct.
                      </p>
                    </div>
                  </div>
                  <div className="relative border-t border-l border-black h-20">
                    <p className="absolute top-0 right-0 p-1">
                      for GOLDEN KNITTS
                    </p>
                    <div className="flex justify-center"></div>

                    <p className="absolute bottom-0 right-0 p-1">
                      {" "}
                      Authorised Signatory
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center ">
              {" "}
              <div>
                {" "}
                <p>This is a Computer Generated Invoice</p>
              </div>
            </div>
            <div className="page-break"></div>
            <div className="empty-page"></div>
          </div>
        </>
      </div>
    </Page>
  );
};

export default TaxInvoice;
