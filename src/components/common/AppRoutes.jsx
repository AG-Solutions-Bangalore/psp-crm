/* eslint-disable no-unused-vars */
import Login from "@/app/auth/Login";
import Dashboard from "@/app/dashboard/Dashboard";
import NotFound from "@/app/errors/NotFound";
import GranualsForm from "@/app/granuals/GranualsForm";
import GranualsList from "@/app/granuals/GranualsList";
import GranualProductForm from "@/app/rawmaterialproduction/GranualProductForm";
import GranualsToYarnProduction from "@/app/granualstoyarnproduction/GranualsToYarnProduction";
import GranualsToYarnProductionForm from "@/app/granualstoyarnproduction/GranualsToYarnProductionForm";
import YarnProductionForm from "@/app/granualstoyarnproduction/YarnProductionForm";
import ColorList from "@/app/master/color/ColorList";
import ItemList from "@/app/master/item/ItemList";
import TeamList from "@/app/master/team/TeamList";
import CreateVendor from "@/app/master/vendor/CreateVendor";
import VendorEdit from "@/app/master/vendor/VendorEdit";
import VendorList from "@/app/master/vendor/VendorList";
import RawMaterialForm from "@/app/rawmaterial/RawMaterialForm";
import RawMaterialList from "@/app/rawmaterial/RawMaterialList";
import RawMaterialProduction from "@/app/rawmaterialproduction/RawMaterialProduction";
import RawMaterialProductionForm from "@/app/rawmaterialproduction/RawMaterialProductionForm";
import FabricStockReport from "@/app/report/stock/FabricStockReport";
import GranualsStockReport from "@/app/report/stock/GranualsStockReport";
import RawMaterialReport from "@/app/report/stock/RawMaterialReport";
import YarnStockReport from "@/app/report/stock/YarnStockReport";
import TaxInvoice from "@/app/report/taxinvoice/TaxInvoice";
import SalesView from "@/app/sales/SalesView";
import SalesForm from "@/app/sales/SalesForm";
import WebsiteEnquiry from "@/app/websiteenquiry/WebsiteEnquiry";
import FabricProductionForm from "@/app/yarntofabricproduction/FabricProductionForm";
import YarnToFabricProductionForm from "@/app/yarntofabricproduction/YarnToFabricProductionForm";
import YarnToFabricProductionList from "@/app/yarntofabricproduction/YarnToFabricProductionList";
import FabricWorkProductionForm from "@/app/yarntofabricworkproduction/FabricWorkProductionForm";
import YarnToFabricWorkProductionForm from "@/app/yarntofabricworkproduction/YarnToFabricWorkProductionForm";
import YarnToFabricWorkProductionList from "@/app/yarntofabricworkproduction/YarnToFabricWorkProductionList";
import { Route, Routes } from "react-router-dom";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import Maintenance from "./Maintenance";
import SalesList from "@/app/sales/SalesList";
import { RawMaterialTabs } from "@/app/Tabs/RawMaterialTabs/RawMaterialTabs";
import { GranualsTabs } from "@/app/Tabs/GranualsTabs/GranualsTabs";
import { SalesTabs } from "@/app/Tabs/SalesTabs/SalesTabs";
import { YarnTabs } from "@/app/Tabs/YarnTabs/YarnTabs";
import SalesReport from "@/app/report/sales/SalesYarnReport";
import SalesFabricReport from "@/app/report/sales/SalesFabricReport";
import SalesYarnReport from "@/app/report/sales/SalesYarnReport";
import PurchaseRawMaterialReport from "@/app/report/purchase/PurchaseRawMaterialReport";
import PurchaseGranualsReport from "@/app/report/purchase/PurchaseGranualsReport";
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
      {/* <Route path="/raw-material" element={<RawMaterialList />} /> */}
      <Route path="/raw-material" element={<RawMaterialTabs />} />
      <Route path="/raw-material-create" element={<RawMaterialForm />} />
      <Route path="/raw-material-update/:id" element={<RawMaterialForm />} />
      {/* //GRANUALS */}
      {/* <Route path="/granuals" element={<GranualsList />} /> */}
      <Route path="/granuals" element={<GranualsTabs />} />
      <Route path="/granuals-create" element={<GranualsForm />} />
      <Route path="/granuals-update/:id" element={<GranualsForm />} />
      {/* //Yarn */}
      {/* <Route path="/sales" element={<SalesList />} /> */}
      <Route path="/sales" element={<SalesTabs />} />
      <Route path="/sales-create" element={<SalesForm />} />
      <Route path="/sales-update/:id" element={<SalesForm />} />
      <Route path="/sales-view/:id" element={<SalesView />} />

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

      <Route path="/yarn-fabric-production" element={<YarnTabs />} />

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


      <Route path="/report/sales-fabric" element={<SalesFabricReport />} />
      <Route path="/report/sales-yarn" element={<SalesYarnReport />} />


      <Route path="/report/purchase-raw-material" element={<PurchaseRawMaterialReport />} />
      <Route path="/report/purchase-granuals" element={<PurchaseGranualsReport />} />
      {/* //Website enquiryt */}
      <Route path="/website-enquiry" element={<WebsiteEnquiry />} />
      <Route path="/report-tax-invoice" element={<TaxInvoice />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
