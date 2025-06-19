import { useQuery, useQueryClient } from "@tanstack/react-query";
import BASE_URL from "@/config/BaseUrl";
import usetoken from "@/api/usetoken";

const STALE_TIME = 5 * 60 * 1000;
const CACHE_TIME = 30 * 60 * 1000;

const fetchData = async (endpoint, token) => {
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error(`Failed to fetch data from ${endpoint}`);
  return response.json();
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

export const useFetchProduct = () => {
  return useQuery(createQueryConfig(["product"], "/api/panel-fetch-product"));
};

export const useFetchItemNames = () => {
  return useQuery(
    createQueryConfig(["itemNames"], "/api/panel-fetch-itemname")
  );
};
export const useFetchState = () => {
  return useQuery(createQueryConfig(["state"], "/api/panel-fetch-state"));
};

export const useFetchCompanies = () => {
  return useQuery(createQueryConfig(["companies"], "/api/panel-fetch-company"));
};

export const useFetchVendor = () => {
  return useQuery(createQueryConfig(["vendor"], "/api/panel-fetch-vendor"));
};
