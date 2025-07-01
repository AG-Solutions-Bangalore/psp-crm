import { PANEL_LOGOUT } from "@/api";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { logout } from "@/redux/slices/AuthSlice";
import { persistor } from "@/redux/store";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useToast } from "./use-toast";

const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = usetoken();
  const handleLogout = async () => {
    try {
      // await apiClient.post(`${PANEL_LOGOUT}`, null, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      await persistor.flush();
      localStorage.clear();
      dispatch(logout());

      navigate("/");
      setTimeout(() => persistor.purge(), 1000);
    } catch (error) {
      toast({
        title: "Logout Error",
        description:
          error?.response?.data?.message ||
          "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return handleLogout;
};

export default useLogout;
