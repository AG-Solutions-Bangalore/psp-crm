import Page from "@/app/page/page";
import FabricStockReport from "@/app/report/stock/FabricStockReport";
import YarnStockReport from "@/app/report/stock/YarnStockReport";
import SalesList from "@/app/sales/SalesList";
import YarnToFabricProductionList from "@/app/yarntofabricproduction/YarnToFabricProductionList";
import YarnToFabricWorkProductionList from "@/app/yarntofabricworkproduction/YarnToFabricWorkProductionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setSalesTab } from "@/redux/slices/salestabsSlice";
import { setYarnTab } from "@/redux/slices/yarntabSlice";
import { useDispatch, useSelector } from "react-redux";

export function YarnTabs() {
  const dispatch = useDispatch();
  const activeTab = useSelector(
    (state) => state.yarntab.yarnTab || "yarnstock"
  );

  const handleTabChange = (value) => {
    dispatch(setYarnTab(value));
  };

  return (
    <Page>
      <div className="text-left text-2xl text-gray-800 font-[400] ml-2">
        Yarn
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full mt-4"
      >
        <div className="flex items-center justify-between">
          <TabsList className="gap-2">
            <TabsTrigger
              value="yarnstock"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Stock
            </TabsTrigger>
            <TabsTrigger
              value="production"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {" "}
              Production
            </TabsTrigger>
            <TabsTrigger
              value="jobwork"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Job Work
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="yarnstock" className="mt-4">
          <YarnStockReport />
        </TabsContent>
        <TabsContent value="production" className="mt-4">
          <YarnToFabricProductionList />
        </TabsContent>
        <TabsContent value="jobwork" className="mt-4">
          <YarnToFabricWorkProductionList />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
