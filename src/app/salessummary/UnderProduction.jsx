import {
  GRANUALS_TO_YARN_PRODUCTION,
  RAW_MATERIAL_PRODUCTION_LIST,
  YARN_TO_FABRIC_PRODUCTION,
  YARN_TO_FABRIC_WORK_PRODUCTION,
} from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { useQuery } from "@tanstack/react-query";
import React from "react";

const fetchProductionData = (url: string, token: string) =>
  apiClient.get(url, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.data.data);

const UnderProduction = () => {
  const token = usetoken();

  const { data: rawmaterialproduction, isLoading, isError, refetch } = useQuery({
    queryKey: ["rawmaterialproduction"],
    queryFn: () => fetchProductionData(RAW_MATERIAL_PRODUCTION_LIST, token),
  });

  const { data: granualstoyarnproduction } = useQuery({
    queryKey: ["granualstoyarnproduction"],
    queryFn: () => fetchProductionData(GRANUALS_TO_YARN_PRODUCTION, token),
  });

  const { data: yarntofabricproduction } = useQuery({
    queryKey: ["yarntofabricproduction"],
    queryFn: () => fetchProductionData(YARN_TO_FABRIC_PRODUCTION, token),
  });

  const { data: yarntofabricworkproduction } = useQuery({
    queryKey: ["yarntofabricworkproduction"],
    queryFn: () => fetchProductionData(YARN_TO_FABRIC_WORK_PRODUCTION, token),
  });

  return <>{/* Render your production data here */}</>;
};

export default UnderProduction;
