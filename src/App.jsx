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
  return (
    <>
      <ValidationWrapper>
        <VersionCheck />
        <Toaster />
        <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} />
        <AppRoutes />
      </ValidationWrapper>
    </>
  );
}

export default App;
