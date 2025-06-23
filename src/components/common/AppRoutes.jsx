import Login from "@/app/auth/Login";
import { Route, Routes } from "react-router-dom";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import Maintenance from "./Maintenance";
import TeamList from "@/app/master/team/TeamList";
import ItemList from "@/app/master/item/ItemList";
import CreateVendor from "@/app/master/vendor/CreateVendor";
import VendorList from "@/app/master/vendor/VendorList";
import VendorEdit from "@/app/master/vendor/VendorEdit";
import RawMaterialList from "@/app/rawmaterial/RawMaterialList";
import RawMaterialForm from "@/app/rawmaterial/RawMaterialForm";
import GranualsList from "@/app/granuals/GranualsList";
import GranualsForm from "@/app/granuals/GranualsForm";
import YarnList from "@/app/yarn/YarnList";
import YarnForm from "@/app/yarn/YarnForm";
import NotFound from "@/app/errors/NotFound";
import ColorList from "@/app/master/color/ColorList";
const AppRoutes = () => {
  return (
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
      <Route path="/master/vendor/create-vendor" element={<CreateVendor />} />
      <Route path="/master/vendor/edit-vendor/:id" element={<VendorEdit />} />
      {/* //RAWMATERIAL */}
      <Route path="/raw-material" element={<RawMaterialList />} />
      <Route path="/raw-material-create" element={<RawMaterialForm />} />
      <Route path="/raw-material-update/:id" element={<RawMaterialForm />} />
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
  );
};

export default AppRoutes;
