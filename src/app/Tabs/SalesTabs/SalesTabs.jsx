import Page from "@/app/page/page";
import FabricStockReport from "@/app/report/stock/FabricStockReport";
import YarnStockReport from "@/app/report/stock/YarnStockReport";
import SalesList from "@/app/sales/SalesList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setSalesTab } from "@/redux/slices/salestabsSlice";
import { useDispatch, useSelector } from "react-redux";

export function SalesTabs() {
  const dispatch = useDispatch();
  const activeTab = useSelector(
    (state) => state.salestab.salesTab || "yarnstock"
  );

  const handleTabChange = (value) => {
    dispatch(setSalesTab(value));
  };

  return (
    <Page>
      <div className="text-left text-2xl text-gray-800 font-[400] ml-2">
        Sales
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full mt-4"
      >
        <div className="flex items-center justify-between">
          <TabsList className="gap-2">
            <TabsTrigger
              value="sales"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Sales
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="sales" className="mt-4">
          <SalesList />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
