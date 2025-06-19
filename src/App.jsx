import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./app/auth/Login";

import ColorList from "./app/master/color/ColorList";
import ItemList from "./app/master/item/ItemList";
import TeamList from "./app/master/team/TeamList";
import CreateVendor from "./app/master/vendor/CreateVendor";
import VendorEdit from "./app/master/vendor/VendorEdit";
import VendorList from "./app/master/vendor/VendorList";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import { Toaster } from "./components/ui/toaster";
import VersionCheck from "./utils/VersionCheck";
import ValidationWrapper from "./utils/ValidationWrapper";
import NotFound from "./app/errors/NotFound";

function App() {
  const navigate = useNavigate();
  // const time = localStorage.getItem("token-expire-time");
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <ValidationWrapper>
        <VersionCheck />
        <Toaster />
        {/* <DisableRightClick /> */}
        {/* <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} /> */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Master - Team  */} <Route path="/home" element={<TeamList />} />
          <Route path="/master/team" element={<TeamList />} />
          <Route path="/master/color" element={<ColorList />} />
          <Route path="/master/item" element={<ItemList />} />
          <Route path="/master/vendor" element={<VendorList />} />
          <Route
            path="/master/vendor/create-vendor"
            element={<CreateVendor />}
          />
          <Route
            path="/master/vendor/edit-vendor/:id"
            element={<VendorEdit />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ValidationWrapper>
    </>
  );
}

export default App;
