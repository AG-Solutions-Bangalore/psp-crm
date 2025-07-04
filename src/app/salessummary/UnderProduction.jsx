import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  RAW_MATERIAL_PRODUCTION_LIST,
  GRANUALS_TO_YARN_PRODUCTION,
  YARN_TO_FABRIC_PRODUCTION,
  YARN_TO_FABRIC_WORK_PRODUCTION,
} from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";

const fetchProductionData = (url, token) =>
  apiClient
    .get(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.data.data);

const UnderProduction = () => {
  const token = usetoken();

  const { data: rawMaterialProduction } = useQuery({
    queryKey: ["rawMaterialProduction"],
    queryFn: () => fetchProductionData(RAW_MATERIAL_PRODUCTION_LIST, token),
  });

  const { data: granualsToYarnProduction } = useQuery({
    queryKey: ["granualsToYarnProduction"],
    queryFn: () => fetchProductionData(GRANUALS_TO_YARN_PRODUCTION, token),
  });

  const { data: yarnToFabricProduction } = useQuery({
    queryKey: ["yarnToFabricProduction"],
    queryFn: () => fetchProductionData(YARN_TO_FABRIC_PRODUCTION, token),
  });

  const { data: yarnToFabricWorkProduction } = useQuery({
    queryKey: ["yarnToFabricWorkProduction"],
    queryFn: () => fetchProductionData(YARN_TO_FABRIC_WORK_PRODUCTION, token),
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Under Production Data</h2>
      <pre className="bg-gray-100 p-2 rounded">
        Raw Material: {JSON.stringify(rawMaterialProduction, null, 2)}
      </pre>
      <pre className="bg-gray-100 p-2 rounded">
        Granuals to Yarn: {JSON.stringify(granualsToYarnProduction, null, 2)}
      </pre>
      <pre className="bg-gray-100 p-2 rounded">
        Yarn to Fabric: {JSON.stringify(yarnToFabricProduction, null, 2)}
      </pre>
      <pre className="bg-gray-100 p-2 rounded">
        Yarn to Fabric (Work):{" "}
        {JSON.stringify(yarnToFabricWorkProduction, null, 2)}
      </pre>
    </div>
  );
};

export default UnderProduction;
