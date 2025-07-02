import Page from "@/app/page/page";
import FabricStockReport from "@/app/report/stock/FabricStockReport";
import YarnToFabricProductionList from "@/app/yarntofabricproduction/YarnToFabricProductionList";
import YarnToFabricWorkProductionList from "@/app/yarntofabricworkproduction/YarnToFabricWorkProductionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setFabricTab } from "@/redux/slices/fabrictabSlice";
import { useDispatch, useSelector } from "react-redux";

export function FabricTabs() {
  const dispatch = useDispatch();
  const activeTab = useSelector(
    (state) => state.fabrictab.fabricTab || "yarntofabric"
  );

  const handleTabChange = (value) => {
    dispatch(setFabricTab(value));
  };

  return (
    <Page>
      <div className="text-left text-2xl text-gray-800 font-[400] ml-2">
        Fabric
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full mt-4"
      >
        <div className="flex items-center justify-between">
          <TabsList className="gap-2">
            <TabsTrigger
              value="yarntofabric"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Fabric Stock
            </TabsTrigger>
            {/* <TabsTrigger
              value="yarntofabricwork"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Fabric Work Production
            </TabsTrigger> */}
          </TabsList>
        </div>

        <TabsContent value="yarntofabric" className="mt-4">
          <FabricStockReport />
        </TabsContent>
        {/* <TabsContent value="yarntofabricwork" className="mt-4">
          <YarnToFabricWorkProductionList />
        </TabsContent> */}
      </Tabs>
    </Page>
  );
}
