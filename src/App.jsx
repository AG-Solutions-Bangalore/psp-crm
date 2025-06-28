import { useSelector } from "react-redux";
import AppRoutes from "./components/common/AppRoutes";
import SessionTimeoutTracker from "./components/SessionTimeoutTracker/SessionTimeoutTracker";
import { Toaster } from "./components/ui/toaster";
import useLogout from "./hooks/useLogout";
import ValidationWrapper from "./utils/ValidationWrapper";
import VersionCheck from "./utils/VersionCheck";

function App() {
  const time = useSelector((state) => state.auth.token_expire_time);
  const handleLogout = useLogout();
  console.log(time, "tis");
  return (
    <>
      <ValidationWrapper>
        <VersionCheck />
        <Toaster />
        {/* <DisableRightClick /> */}
        <SessionTimeoutTracker expiryTime="2025-06-28 11:51:25" onLogout={handleLogout} />
        <AppRoutes />
      </ValidationWrapper>
    </>
  );
}

export default App;
