import { Route, Routes } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import ProtectedRoute from "./ProtectedRoute";
import SignIn from "../pages/auth/SignIn";
import Dashboard from "../pages/home/Dashboard";

import NotFound from "../pages/errors/NotFound";
import PatientList from "@/pages/patient/PatientList";
import PatientHistory from "@/pages/patient/PatientHistory";
import ReportView from "@/pages/report/ReportView";
import PatientSummary from "@/pages/summary/PatientSummary";
import DeviceList from "@/pages/device/DeviceList";
import TeamList from "@/pages/team/TeamList";
import UserPage from "@/pages/userManagement/UserPage";
import CreatePage from "@/pages/userManagement/CreatePage";
import ManagementDashboard from "@/pages/userManagement/ManagementDashboard";
import CreateButton from "@/pages/userManagement/CreateButton";
import UserTypeList from "@/pages/userType/UserTypeList";
import EditUserType from "@/pages/userType/EditUserType";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import Maintenance from "@/pages/auth/Maintenance";
import HospitalList from "@/pages/hospital/HospitalList";
import HospitalAssignDeviceList from "@/pages/hospital/hospitalAssignDevice/HospitalAssignDeviceList";
import HospitalDeviceReport from "@/pages/report/hospitalDeviceReport/HospitalDeviceReport";
import DeviceUser from "@/pages/deviceUser/DeviceUser";
import DoctorsList from "@/pages/doctors/DoctorsList";
import Profile from "@/pages/profile/Profile";
import Enquiry from "@/pages/enquiry/Enquiry";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute />}>
        <Route path="/" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Route>

      <Route path="/" element={<ProtectedRoute />}>
        <Route path="/home" element={<Dashboard />} />

        <Route path="/doctors" element={<DoctorsList />} />
        <Route path="/patient" element={<PatientList />} />

        <Route path="/patient/history/:id" element={<PatientHistory />} />

        <Route path="/patient/report/:id" element={<ReportView />} />
        <Route path="/summary" element={<PatientSummary />} />
        <Route path="/hospital-report" element={<HospitalDeviceReport />} />

        {/* device  */}
        <Route path="/hospital" element={<HospitalList />} />
        <Route path="/hospital/assign-device/:id" element={<HospitalAssignDeviceList />} />
        <Route path="/device" element={<DeviceList />} />
        <Route path="/device-user" element={<DeviceUser />} />

        {/* team list  */}
        {/* <Route path="/team" element={<TeamList />} /> */}
        {/* user management */}
        <Route path="/userManagement" element={<UserPage />} />
        <Route
          path="/management-dashboard/:id"
          element={<ManagementDashboard />}
        />
        <Route path="/page-management" element={<CreatePage />} />
        <Route path="/button-management" element={<CreateButton />} />

        {/* usertype */}
        <Route path="/user-type" element={<UserTypeList />} />
       

        <Route path="/edit-user-type/:id" element={<EditUserType />} />
        {/* profile & change password  */}
         <Route path="/profile" element={<Profile />} />
         {/* enquiry  */}
         <Route path="/enquiry" element={<Enquiry />} />

      </Route>



      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;