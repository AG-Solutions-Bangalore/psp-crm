import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import BASE_URL from "@/config/BaseUrl";
import { decryptId } from "@/utils/encyrption/Encyrption";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "../dashboard/page";
import { useReactToPrint } from "react-to-print";

const ViewCosting = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [costingeData, setCostingData] = useState({});
  const { id } = useParams();
  const decryptedId = decryptId(id);
  const containerRef = useRef();

  const [consigneData, setConsigneData] = useState([]);
  const fetchCostingById = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${BASE_URL}/api/panel-fetch-costing-by-id/${decryptedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        const { costing, costingSub } = response.data;
        setCostingData((prev) => ({
          ...prev,
          ...costing,
        }));
        setConsigneData(costingSub || []);
      }
    } catch (error) {
      console.error("Error fetching costing data:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (decryptedId) {
      fetchCostingById();
    }
  }, [decryptedId]);
  const handlePrintPdf = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: "Costing",

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
    return <LoaderComponent name="Costing Data" />; // ✅ Correct prop usage
  }

  // Render error state
  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Costing Data"
        refetch={fetchCostingById()}
      />
    );
  }
  return (
    <Page>
      <div className="p-4 " ref={containerRef}>
        <h2>
          {costingeData?.branch_name}
             <span></span>{costingeData?.costing_product}
        </h2>
        <h2>
          CHILLI COMBINATIONS - CV SUMBER- JKT- 60-70 SHU & 80-90 ASTA (INV NO:{" "}
          {costingeData?.costing_no} )
        </h2>

        <table className="w-full border border-black  rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-[10px] font-medium">
              <th className="p-1 text-center border border-black  whitespace-nowrap">
                Date
              </th>
              <th className="p-1 text-center border border-black  whitespace-nowrap">
                Variety
              </th>
              <th className="p-1 text-center border border-black  whitespace-nowrap">
                Percentage
              </th>
              <th className="p-1 text-center border border-black  whitespace-nowrap">
                RM Cost
              </th>
              <th className="p-1 text-center border border-black  whitespace-nowrap">
                Material Cost
              </th>
              <th className="p-1 text-center border border-black  whitespace-nowrap">
                Color
              </th>
              <th className="p-1 text-center border border-black  whitespace-nowrap">
                Ex-Color
              </th>
              <th className="p-1 text-center border border-black  whitespace-nowrap">
                Pungency
              </th>
              <th className="p-1 text-center border border-black  whitespace-nowrap">
                Ex-Pungency
              </th>
            </tr>
          </thead>

          <tbody>
            {consigneData.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 text-[10px] text-center "
              >
                <td className="p-1 border border-black ">
                  {row.costingSub_date || "-"}
                </td>
                <td className="p-1 border border-black ">
                  {row.costingSub_variety || "-"}
                </td>
                <td className="p-1 border border-black ">
                  {row.costingSub_percentage || "-"}%
                </td>
                <td className="p-1 border border-black ">
                  {row.costingSub_rm_cost || "0.00"}
                </td>
                <td className="p-1 border border-black ">
                  {row.costingSub_material_cost || "0.00"}
                </td>
                <td className="p-1 border border-black ">
                  {row.costingSub_colour || "-"}
                </td>
                <td className="p-1 border border-black ">
                  {row.costingSub_ex_colour || "-"}
                </td>
                <td className="p-1 border border-black ">
                  {row.costingSub_pungency || "-"}
                </td>
                <td className="p-1 border border-black ">
                  {row.costingSub_ex_pungency || "-"}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-gray-200 font-semibold text-[10px]  text-center  border border-black ">
              <td className="p-1 border border-black ">Total</td>
              <td className="p-1 border border-black ">-</td>
              <td className="p-1 border border-black ">
                {" "}
                {consigneData.reduce(
                  (acc, row) =>
                    acc + (parseFloat(row.costingSub_percentage) || 0),
                  0
                )}
                %
              </td>
              <td className="p-1 border border-black ">-</td>
              <td className="p-1 border border-black ">
                {" "}
                {consigneData
                  .reduce(
                    (acc, row) =>
                      acc + (parseFloat(row.costingSub_material_cost) || 0),
                    0
                  )
                  .toFixed(2)}
              </td>
              <td className="p-1 border border-black ">-</td>
              <td className="p-1 border border-black ">
                {consigneData
                  .reduce(
                    (acc, row) =>
                      acc + (parseFloat(row.costingSub_ex_colour) || 0),
                    0
                  )
                  .toFixed(2)}
              </td>
              <td className="p-1 border border-black ">-</td>
              <td className="p-1 border border-black ">
                {consigneData
                  .reduce(
                    (acc, row) =>
                      acc + (parseFloat(row.costingSub_ex_pungency) || 0),
                    0
                  )
                  .toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Page>
  );
};

export default ViewCosting;
