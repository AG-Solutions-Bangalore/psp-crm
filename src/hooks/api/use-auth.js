import usetoken from "@/api/usetoken";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useAuth = () => {
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = usetoken();
  const company = useSelector((state) => state.auth.companyname);
  useEffect(() => {
    const userData = {
      name: company,
    };

    if (token) {
      setAuthData({ user: userData });
    } else {
      setAuthData({ user: null });
    }

    setIsLoading(false);
  }, []);

  return { data: authData, isLoading };
};

export default useAuth;
