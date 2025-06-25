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
import FabricSaleList from "@/app/fabricsale/FabricSaleList";
import FabricSaleForm from "@/app/fabricsale/FabricSaleForm";
import RawMaterialProduction from "@/app/rawmaterialproduction/RawMaterialProduction";
import RawMaterialProductionForm from "@/app/rawmaterialproduction/RawMaterialProductionForm";
import GranualProductForm from "@/app/granualsproduction/GranualProductForm";
import GranualsToYarnProduction from "@/app/granualstoyarnproduction/GranualsToYarnProduction";
import GranualsToYarnProductionForm from "@/app/granualstoyarnproduction/GranualsToYarnProductionForm";
import YarnProductionForm from "@/app/granualstoyarnproduction/YarnProductionForm";
import YarnToFabricProductionList from "@/app/yarntofabricproduction/YarnToFabricProductionList";
import YarnToFabricProductionForm from "@/app/yarntofabricproduction/YarnToFabricProductionForm";
import FabricProductionForm from "@/app/yarntofabricproduction/FabricProductionForm";
import YarnToFabricWorkProductionForm from "@/app/yarntofabricworkproduction/YarnToFabricWorkProductionForm";
import YarnToFabricWorkProductionList from "@/app/yarntofabricworkproduction/YarnToFabricWorkProductionList";
import FabricWorkProductionForm from "@/app/yarntofabricworkproduction/FabricWorkProductionForm";
import RawMaterialReport from "@/app/report/stock/RawMaterialReport";
import GranualsStockReport from "@/app/report/stock/GranualsStockReport";
import YarnStockReport from "@/app/report/stock/YarnStockReport";
import FabricStockReport from "@/app/report/stock/FabricStockReport";
import Dashboard from "@/app/dashboard/Dashboard";
import WebsiteEnquiry from "@/app/websiteenquiry/WebsiteEnquiry";
import TaxInvoice from "@/app/report/taxinvoice/TaxInvoice";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/maintenance" element={<Maintenance />} />
      {/* HOME */}
      <Route path="/home" element={<Dashboard />} />
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
      {/* //FabricSales */}
      <Route path="/fabric-sale" element={<FabricSaleList />} />
      <Route path="/fabric-sale-create" element={<FabricSaleForm />} />
      <Route path="/fabric-sale-update/:id" element={<FabricSaleForm />} />
      {/* //rawmaterialproduction */}
      <Route
        path="/raw-material-production"
        element={<RawMaterialProduction />}
      />
      <Route
        path="/raw-material-production-create"
        element={<RawMaterialProductionForm />}
      />
      <Route
        path="/raw-material-production-update/:id"
        element={<RawMaterialProductionForm />}
      />
      <Route path="/granual-production/:id" element={<GranualProductForm />} />
      {/* //GRANUAL_TO_YARN PRODUCTION_LIST */}
      <Route
        path="/granual-yarn-production"
        element={<GranualsToYarnProduction />}
      />
      <Route
        path="/granual-yarn-production-create"
        element={<GranualsToYarnProductionForm />}
      />
      <Route
        path="/granual-yarn-production-update/:id"
        element={<GranualsToYarnProductionForm />}
      />
      <Route path="/yarn-production/:id" element={<YarnProductionForm />} />
      {/* //YARN_TO_FABRIC PRODUCTION_LIST */}

      <Route
        path="/yarn-fabric-production"
        element={<YarnToFabricProductionList />}
      />

      <Route
        path="/yarn-fabric-production-create"
        element={<YarnToFabricProductionForm />}
      />
      <Route
        path="/yarn-fabric-production-update/:id"
        element={<YarnToFabricProductionForm />}
      />
      <Route path="/fabric-production/:id" element={<FabricProductionForm />} />

      {/* //YARN_TO_FABRIC WORK PRODUCTION_LIST */}

      <Route
        path="/yarn-fabric-work-production"
        element={<YarnToFabricWorkProductionList />}
      />

      <Route
        path="/yarn-fabric-work-production-create"
        element={<YarnToFabricWorkProductionForm />}
      />
      <Route
        path="/yarn-fabric-work-production-update/:id"
        element={<YarnToFabricWorkProductionForm />}
      />
      <Route
        path="/fabric-work-production/:id"
        element={<FabricWorkProductionForm />}
      />
      {/* //Report */}
      <Route path="/report/raw-material" element={<RawMaterialReport />} />
      <Route path="/report/granuals" element={<GranualsStockReport />} />
      <Route path="/report/yarn" element={<YarnStockReport />} />
      <Route path="/report/fabric" element={<FabricStockReport />} />
      {/* //Website enquiryt */}
      <Route path="/website-enquiry" element={<WebsiteEnquiry />} />
      <Route path="/report-tax-invoice" element={<TaxInvoice />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
