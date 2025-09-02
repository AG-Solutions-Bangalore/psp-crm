
import { DOT_ENV, PANEL_CHECK } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { useToast } from "@/hooks/use-toast";
import { logout } from "@/redux/slices/AuthSlice";
import { setShowUpdateDialog } from "@/redux/slices/versionSlice";
import { persistor } from "@/redux/store";
import CryptoJS from "crypto-js";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const secretKey = import.meta.env.VITE_SECRET_KEY;
const validationKey = import.meta.env.VITE_SECRET_VALIDATION;

const AppInitializer = ({ children }) => {
  const token = usetoken();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const localVersion = useSelector((state) => state.auth?.version);

  useEffect(() => {
    const validateEnvironment = async () => {
      try {
        if (!secretKey) {
          navigate("/maintenance");
          throw new Error("Missing SECRET_KEY");
        }

        const statusRes = await apiClient.get(PANEL_CHECK);
        if (statusRes.data?.message !== "Success") {
          throw new Error("Panel status check failed");
        }
  
        const serverVer = statusRes?.data?.version?.version_panel;

        if (token) {
          dispatch(
            setShowUpdateDialog({
              showUpdateDialog: localVersion !== serverVer,
              version: serverVer,
            })
          );
        }

        const dotenvRes = await apiClient.get(DOT_ENV);
        const dynamicValidationKey = dotenvRes?.data?.data;

        if (!dynamicValidationKey) {
          throw new Error("Validation key missing");
        }

        const computedHash = validationKey
          ? CryptoJS.MD5(validationKey).toString()
          : "";

        if (!secretKey || computedHash !== dynamicValidationKey) {
          throw new Error("Invalid environment config");
        }

        if (location.pathname === "/maintenance") {
          navigate("/");
        }
      } catch (error) {
        console.error("❌ App Initialization Error:", error.message);

        await persistor.flush();
        localStorage.clear();
        dispatch(logout());
        setTimeout(() => persistor.purge(), 1000);

        toast({
          title: "Environment Error",
          description: error.message,
          variant: "destructive",
        });

        if (location.pathname !== "/maintenance") {
          navigate("/maintenance");
        }
      }
    };

    validateEnvironment();
  }, [navigate, dispatch]);

  return children;
};

export default AppInitializer;
