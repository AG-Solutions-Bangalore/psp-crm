import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./app/auth/Login";

import ContractList from "./app/contract/ContractList";

import Home from "./app/home/Home";

import InvoiceList from "./app/invoice/InvoiceList";


import ForgotPassword from "./components/ForgotPassword/ForgotPassword";
import { Toaster } from "./components/ui/toaster";
import DisableRightClick from "./components/DisableRightClick/DisableRightClick";
import TeamList from "./app/master/team/TeamList";
import ColorList from "./app/master/color/ColorList";
import ItemList from "./app/master/item/ItemList";
import VendorList from "./app/master/vendor/VendorList";
import CreateVendor from "./app/master/vendor/CreateVendor";
import VendorEdit from "./app/master/vendor/VendorEdit";

function App() {
  const navigate = useNavigate();
  // const time = localStorage.getItem("token-expire-time");
 const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <Toaster />
      {/* <DisableRightClick /> */}
      {/* <SessionTimeoutTracker expiryTime={time} onLogout={handleLogout} /> */}
      <Routes>
        {/* Login Page        */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        {/* Dashboard  */}
        <Route path="/home" element={<Home />} />
        {/* Contract  */}
        <Route path="/contract" element={<ContractList />} />
      
        {/* Invoice  */}
        <Route path="/invoice" element={<InvoiceList />} />
       
      

      

        {/* Master - Team  */}
 <Route path="/master/team" element={<TeamList />} />

 <Route path="/master/color" element={<ColorList />} />

 <Route path="/master/item" element={<ItemList />} />
 <Route path="/master/vendor" element={<VendorList />} />
 <Route path="/master/vendor/create-vendor" element={<CreateVendor />} />
 <Route path="/master/vendor/edit-vendor/:id" element={<VendorEdit />} />
       
        {/* //management */}
        {/* <Route path="/userManagement" element={<UserPage />} />
        <Route
          path="/management-dashboard/:id"
          element={<ManagementDashboard />}
        />
        <Route path="/page-management" element={<CreatePage />} />
        <Route path="/button-management" element={<CreateButton />} />
  
        <Route path="/user-type" element={<UserTypeList />} />
        <Route path="/edit-user-type/:id" element={<EditUserType />} /> */}
      </Routes>
    </>
  );
}

export default App;
