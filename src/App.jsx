import { Route, Routes } from "react-router-dom";
import Login from "./app/auth/Login";

import { useSelector } from "react-redux";
import NotFound from "./app/errors/NotFound";
import GranualsForm from "./app/granuals/GranualsForm";
import GranualsList from "./app/granuals/GranualsList";
import ColorList from "./app/master/color/ColorList";
import ItemList from "./app/master/item/ItemList";
import TeamList from "./app/master/team/TeamList";
import CreateVendor from "./app/master/vendor/CreateVendor";
import VendorEdit from "./app/master/vendor/VendorEdit";
import VendorList from "./app/master/vendor/VendorList";
import RawMaterialForm from "./app/rawmaterial/RawMaterialForm";
import RawMaterialList from "./app/rawmaterial/RawMaterialList";
import YarnForm from "./app/yarn/YarnForm";
import YarnList from "./app/yarn/YarnList";
import Maintenance from "./components/common/Maintenance";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import SessionTimeoutTracker from "./components/SessionTimeoutTracker/SessionTimeoutTracker";
import { Toaster } from "./components/ui/toaster";
import useLogout from "./hooks/useLogout";
import ValidationWrapper from "./utils/ValidationWrapper";
import VersionCheck from "./utils/VersionCheck";
import DisableRightClick from "./components/DisableRightClick/DisableRightClick";
import AppRoutes from "./components/common/AppRoutes";

function App() {
  const time = useSelector((state) => state.auth.token_expire_time);
  const handleLogout = useLogout();

  return (
    <>
      <ValidationWrapper>
        <VersionCheck />
        <Toaster />
        {/* <DisableRightClick /> */}
        <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} />
        <AppRoutes />
      </ValidationWrapper>
    </>
  );
}

export default App;
