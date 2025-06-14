import React, { useRef } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Page from "@/app/dashboard/page";
import BASE_URL from "@/config/BaseUrl";
import { Download, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ButtonConfig } from "@/config/ButtonConfig";
import moment from "moment";
import { useReactToPrint } from "react-to-print";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";

const ContractReport = () => {
  const { toast } = useToast();
  const containerRef = useRef();

  var postData = {
    from_date: localStorage.getItem("from_date") || "",
    to_date: localStorage.getItem("to_date") || "",
    branch_short: localStorage.getItem("branch_short") || "",
    buyer: localStorage.getItem("buyer") || "",
    consignee: localStorage.getItem("consignee") || "",
    container_size: localStorage.getItem("container_size") || "",
    product: localStorage.getItem("product") || "",
    status: localStorage.getItem("status") || "",
  };
  const fetchContractData = async () => {
    const token = localStorage.getItem("token");

    const response = await axios.post(
      `${BASE_URL}/api/panel-fetch-contract-report`,
      postData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.contract;
  };

  const {
    data: contractData,
    isLoading,
    isError,
    refetch, // Add refetch here
  } = useQuery({
    queryKey: ["contractData"],
    queryFn: fetchContractData,
    staleTime: Infinity,
  });

  // excel download
  const onSubmit = (e) => {
    e.preventDefault();

    axios({
      url: BASE_URL + "/api/panel-download-contract-report",
      method: "POST",
      data: postData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "contract.csv");
        document.body.appendChild(link);
        link.click();
        toast({
          title: "Success",
          description: "Contract download successfully",
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
  };

  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Product_Stock",
    //   pageStyle: `
    //     @page {
    //       size: A4 landscape;
    //       margin: 5mm;
    //     }
    //     @media print {
    //       body {
    //         font-size: 10px;
    //         margin: 0mm;
    //         padding: 0mm;
    //       }
    //       table {
    //         font-size: 11px;
    //       }
    //       .print-hide {
    //         display: none;
    //       }
    //     }
    //   `,
    // });
    pageStyle: `
  @page {
     size: A4 landscape;
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

  if (isLoading) {
    return (
      <LoaderComponent
        name="Contract Summary
 Data"
      />
    ); // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Contract Summary

 Data"
        refetch={refetch}
      />
    );
  }

  return (
    <Page>
      <div className="p-4 " ref={containerRef}>
        <div className="flex justify-between items-center p-2 rounded-lg mb-5 bg-gray-200">
          <h1 className="text-xl font-bold">Contract Summary</h1>
          <div className="flex flex-row items-center gap-4 font-bold">
            <span className="mr-2">
              {" "}
              From -{moment(postData.from_date).format("DD-MMM-YYYY")}
            </span>
            To -{moment(postData.to_date).format("DD-MMM-YYYY")}
            <div className="print-hide">
              {" "}
              <Button
                variant="default"
                className={`ml-2  ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={handlePrintPdf}
              >
                <Printer className="h-4 w-4" /> Print
              </Button>
              <Button
                variant="default"
                className={`ml-2   ${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
                onClick={onSubmit}
              >
                <Download className="h-4 w-4" /> Download
              </Button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto text-[10px]">
          <table className="w-full border-collapse border border-black">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-black px-2 py-2 ">Company</th>
                <th className="border border-black px-2 py-2 ">
                  Contract Date
                </th>
                <th className="border border-black px-2 py-2 ">Contract No</th>
                <th className="border border-black px-2 py-2 ">Buyer</th>
                <th className="border border-black px-2 py-2 ">Consignee</th>
                <th className="border border-black px-2 py-2 ">
                  Container Size
                </th>
                <th className="border border-black px-2 py-2 ">Product</th>
                <th className="border border-black px-2 py-2 ">Loading Port</th>
                <th className="border border-black px-2 py-2 ">
                  Destination Port
                </th>
                <th className="border border-black px-2 py-2 ">
                  Quantity (MT)
                </th>
                <th className="border border-black px-2 py-2 ">Status</th>
              </tr>
            </thead>
            <tbody>
              {contractData.map((contract, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-black px-2 py-2 ">
                    {contract.branch_short}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {moment(contract.contract_date).format("DD-MM-YYYY")}{" "}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {contract.contract_no}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {contract.contract_buyer}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {contract.contract_consignee}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {contract.contract_container_size}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {contract.contract_product}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {contract.contract_loading}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {contract.contract_destination_port}
                  </td>
                  <td className="border border-black  text-right px-2 py-2 ">
                    {contract.total_qntyInMt}
                  </td>
                  <td className="border border-black px-2 py-2 ">
                    {contract.contract_status}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold bg-gray-200">
                <td
                  colSpan="9"
                  className="border border-black px-2 py-2 text-right"
                >
                  Total:
                </td>
                <td className="border border-black text-right px-2 py-2">
                  {/* {contractData.reduce(
                    (sum, contract) =>
                      sum + Number(contract.total_qntyInMt || 0),
                    0
                  )} */}
                  {contractData.reduce(
                    (sum, contract) => sum + (contract.total_qntyInMt || 0),
                    0
                  )}
                </td>
                <td className="border border-black px-2 py-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Page>
  );
};

export default ContractReport;
