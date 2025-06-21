import { Route, Routes } from "react-router-dom";
import Login from "./app/auth/Login";

import { useSelector } from "react-redux";
import NotFound from "./app/errors/NotFound";
import ColorList from "./app/master/color/ColorList";
import ItemList from "./app/master/item/ItemList";
import TeamList from "./app/master/team/TeamList";
import CreateVendor from "./app/master/vendor/CreateVendor";
import VendorEdit from "./app/master/vendor/VendorEdit";
import VendorList from "./app/master/vendor/VendorList";
import Maintenance from "./components/common/Maintenance";
import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import SessionTimeoutTracker from "./components/SessionTimeoutTracker/SessionTimeoutTracker";
import { Toaster } from "./components/ui/toaster";
import useLogout from "./hooks/useLogout";
import ValidationWrapper from "./utils/ValidationWrapper";
import VersionCheck from "./utils/VersionCheck";
import RawMaterialList from "./app/rawmaterial/RawMaterialList";
import RawMaterialForm from "./app/rawmaterial/RawMaterialForm";
import GranualsList from "./app/granuals/GranualsList";
import GranualsForm from "./app/granuals/GranualsForm";
import YarnList from "./app/yarn/YarnList";
import YarnForm from "./app/yarn/YarnForm";

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
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/maintenance" element={<Maintenance />} />

          {/* HOME */}
          <Route path="/home" element={<TeamList />} />

          {/* Master */}
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
          {/* //RAWMATERIAL */}
          <Route path="/raw-material" element={<RawMaterialList />} />
          <Route path="/raw-material-create" element={<RawMaterialForm />} />
          <Route
            path="/raw-material-update/:id"
            element={<RawMaterialForm />}
          />
          {/* //GRANUALS */}
          <Route path="/granuals" element={<GranualsList />} />
          <Route path="/granuals-create" element={<GranualsForm />} />
          <Route path="/granuals-update/:id" element={<GranualsForm />} />
          {/* //Yarn */}
          <Route path="/yarn" element={<YarnList />} />
          <Route path="/yarn-create" element={<YarnForm />} />
          <Route path="/yarn-update/:id" element={<YarnForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ValidationWrapper>
    </>
  );
}

export default App;
