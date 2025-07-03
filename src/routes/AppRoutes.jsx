import Login from "@/app/auth/Login";
import Dashboard from "@/app/dashboard/Dashboard";
import NotFound from "@/app/errors/NotFound";
import GranualsForm from "@/app/granuals/GranualsForm";
import GranualsToYarnProductionForm from "@/app/granualstoyarnproduction/GranualsToYarnProductionForm";
import YarnProductionForm from "@/app/granualstoyarnproduction/YarnProductionForm";
import ColorList from "@/app/master/color/ColorList";
import ItemList from "@/app/master/item/ItemList";
import TeamList from "@/app/master/team/TeamList";
import CreateVendor from "@/app/master/vendor/CreateVendor";
import VendorEdit from "@/app/master/vendor/VendorEdit";
import VendorList from "@/app/master/vendor/VendorList";
import RawMaterialForm from "@/app/rawmaterial/RawMaterialForm";
import GranualProductForm from "@/app/rawmaterialproduction/GranualProductForm";
import RawMaterialProductionForm from "@/app/rawmaterialproduction/RawMaterialProductionForm";
import ProductionFabricReport from "@/app/report/production/ProductionFabricReport";
import ProductionFabricWorkReport from "@/app/report/production/ProductionFabricWorkReport";
import ProductionGranualsReport from "@/app/report/production/ProductionGranualsReport";
import ProductionRawMaterialReport from "@/app/report/production/ProductionRawMaterialReport";
import ProductionYarnReport from "@/app/report/production/ProductionYarnReport";
import PurchaseGranualsReport from "@/app/report/purchase/PurchaseGranualsReport";
import PurchaseRawMaterialReport from "@/app/report/purchase/PurchaseRawMaterialReport";
import SalesFabricReport from "@/app/report/sales/SalesFabricReport";
import SalesYarnReport from "@/app/report/sales/SalesYarnReport";
import FabricStockReport from "@/app/report/stock/FabricStockReport";
import GranualsStockReport from "@/app/report/stock/GranualsStockReport";
import RawMaterialReport from "@/app/report/stock/RawMaterialReport";
import YarnStockReport from "@/app/report/stock/YarnStockReport";
import TaxInvoice from "@/app/report/taxinvoice/TaxInvoice";
import SalesForm from "@/app/sales/SalesForm";
import SalesView from "@/app/sales/SalesView";
import { GranualsTabs } from "@/app/Tabs/GranualsTabs/GranualsTabs";
import { RawMaterialTabs } from "@/app/Tabs/RawMaterialTabs/RawMaterialTabs";
import { SalesTabs } from "@/app/Tabs/SalesTabs/SalesTabs";
import { FabricTabs } from "@/app/Tabs/FabricTabs/FabricTabs";
import WebsiteEnquiry from "@/app/websiteenquiry/WebsiteEnquiry";
import FabricProductionForm from "@/app/yarntofabricproduction/FabricProductionForm";
import YarnToFabricProductionForm from "@/app/yarntofabricproduction/YarnToFabricProductionForm";
import FabricWorkProductionForm from "@/app/yarntofabricworkproduction/FabricWorkProductionForm";
import YarnToFabricWorkProductionForm from "@/app/yarntofabricworkproduction/YarnToFabricWorkProductionForm";
import Maintenance from "@/components/common/Maintenance";
import { Route, Routes } from "react-router-dom";
import AuthRoute from "./AuthRoute";
import ProtectedRoute from "./ProtectedRoute";
import { YarnTabs } from "@/app/Tabs/YarnTabs/YarnTabs";
import SalesSummary from "@/app/salessummary/SalesSummary";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthRoute />}>
        <Route path="/" element={<Login />} />
        <Route path="/maintenance" element={<Maintenance />} />
      </Route>
      <Route path="/" element={<ProtectedRoute />}>
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
        <Route path="/raw-material" element={<RawMaterialTabs />} />
        <Route path="/raw-material-create" element={<RawMaterialForm />} />
        <Route path="/raw-material-update/:id" element={<RawMaterialForm />} />
        {/* //GRANUALS */}
        <Route path="/granuals" element={<GranualsTabs />} />
        <Route path="/granuals-create" element={<GranualsForm />} />
        <Route path="/granuals-update/:id" element={<GranualsForm />} />
        {/* //Sales */}
        <Route path="/sales" element={<SalesTabs />} />
        <Route path="/sales-create" element={<SalesForm />} />
        <Route path="/sales-update/:id" element={<SalesForm />} />
        <Route path="/sales-view/:id" element={<SalesView />} />
        {/* //sales SalesSummary */}
        <Route path="/sales-summary" element={<SalesSummary />} />

        {/* //rawmaterialproduction */}

        <Route
          path="/raw-material-production-create"
          element={<RawMaterialProductionForm />}
        />
        <Route
          path="/raw-material-production-update/:id"
          element={<RawMaterialProductionForm />}
        />
        <Route
          path="/granual-production/:id"
          element={<GranualProductForm />}
        />
        {/* //GRANUAL_TO_YARN PRODUCTION_LIST */}

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
        <Route path="/yarn" element={<YarnTabs />} />
        <Route path="/yarn-fabric-production" element={<FabricTabs />} />
        <Route
          path="/yarn-fabric-production-create"
          element={<YarnToFabricProductionForm />}
        />
        <Route
          path="/yarn-fabric-production-update/:id"
          element={<YarnToFabricProductionForm />}
        />
        <Route
          path="/fabric-from-production/:id"
          element={<FabricProductionForm />}
        />
        {/* //YARN_TO_FABRIC WORK PRODUCTION_LIST */}

        <Route
          path="/yarn-fabric-work-production-create"
          element={<YarnToFabricWorkProductionForm />}
        />
        <Route
          path="/yarn-fabric-work-production-update/:id"
          element={<YarnToFabricWorkProductionForm />}
        />
        <Route
          path="/fabric-from-work-production/:id"
          element={<FabricWorkProductionForm />}
        />
        {/* //Report */}
        <Route path="/report/raw-material" element={<RawMaterialReport />} />
        <Route path="/report/granuals" element={<GranualsStockReport />} />
        <Route path="/report/yarn" element={<YarnStockReport />} />
        <Route path="/report/fabric" element={<FabricStockReport />} />
        <Route path="/report/sales-fabric" element={<SalesFabricReport />} />
        <Route path="/report/sales-yarn" element={<SalesYarnReport />} />
        <Route
          path="/report/purchase-raw-material"
          element={<PurchaseRawMaterialReport />}
        />
        <Route
          path="/report/purchase-granuals"
          element={<PurchaseGranualsReport />}
        />
        <Route
          path="/report/production-raw-material"
          element={<ProductionRawMaterialReport />}
        />
        <Route
          path="/report/production-granuals"
          element={<ProductionGranualsReport />}
        />
        <Route
          path="/report/production-yarn"
          element={<ProductionYarnReport />}
        />
        <Route
          path="/report/production-fabric"
          element={<ProductionFabricReport />}
        />
        <Route
          path="/report/production-fabric-work"
          element={<ProductionFabricWorkReport />}
        />
        {/* //Website enquiryt */}
        <Route path="/website-enquiry" element={<WebsiteEnquiry />} />
        <Route path="/report-tax-invoice" element={<TaxInvoice />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
