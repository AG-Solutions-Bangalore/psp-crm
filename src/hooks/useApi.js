import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { useQuery } from "@tanstack/react-query";

const STALE_TIME = 5 * 60 * 1000;
const CACHE_TIME = 30 * 60 * 1000;

const fetchData = async (endpoint, token) => {
  if (!token) throw new Error("No authentication token found");

  const response = await apiClient.get(`${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return response.data;
};

const createQueryConfig = (queryKey, endpoint, options = {}) => {
  const token = usetoken();

  return {
    queryKey,
    queryFn: () => fetchData(endpoint, token),
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    retry: 2,
    ...options,
  };
};

export const useFetchState = () => {
  return useQuery(createQueryConfig(["state"], "/api/panel-fetch-state"));
};

export const useFetchCompanies = () => {
  return useQuery(createQueryConfig(["companies"], "/api/panel-fetch-company"));
};

export const useFetchVendor = () => {
  return useQuery(createQueryConfig(["vendor"], "/api/vendor/vendor"));
};
export const useFetchItem = () => {
  return useQuery(createQueryConfig(["items"], "/api/item/active"));
};
export const useFetchColor = () => {
  return useQuery(createQueryConfig(["colors"], "/api/color/active"));
};





