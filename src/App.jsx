import { useSelector } from "react-redux";

import SessionTimeoutTracker from "./components/SessionTimeoutTracker/SessionTimeoutTracker";
import { Toaster } from "./components/ui/toaster";
import useLogout from "./hooks/useLogout";
import ValidationWrapper from "./utils/ValidationWrapper";
import VersionCheck from "./utils/VersionCheck";
import AppRoutes from "./routes/AppRoutes";
import DisableRightClick from "./components/DisableRightClick/DisableRightClick";
import DevToolBlocker from "./components/common/DevToolBlocker";

function App() {
  const time = useSelector((state) => state.auth.token_expire_time);
  const handleLogout = useLogout();
  return (
    <>
      <ValidationWrapper>
        {/* <DevToolBlocker />
        <DisableRightClick /> */}
        <VersionCheck />
        <Toaster />
        <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} />
        <AppRoutes />
      </ValidationWrapper>
    </>
  );
}

export default App;
