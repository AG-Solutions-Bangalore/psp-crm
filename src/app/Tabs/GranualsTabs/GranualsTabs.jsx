import Page from "@/app/page/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setGranualsTab } from "@/redux/slices/granualstabSlice";
import { useDispatch, useSelector } from "react-redux";
import GranualsList from "../../granuals/GranualsList";
import GranualsStockReport from "../../report/stock/GranualsStockReport";
import GranualsToYarnProduction from "@/app/granualstoyarnproduction/GranualsToYarnProduction";

export function GranualsTabs() {
  const dispatch = useDispatch();
  const activeTab = useSelector(
    (state) => state.granualtab?.granualsTab || "stock"
  );

  const handleTabChange = (value) => {
    dispatch(setGranualsTab(value));
  };

  return (
    <Page>
      <div className="text-left text-2xl text-gray-800 font-[400] ml-2">
        Granuals
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full mt-4"
      >
        <div className="flex items-center justify-between">
          <TabsList className="gap-2">
            <TabsTrigger
              value="stock"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Stock
            </TabsTrigger>
            <TabsTrigger
              value="purchase"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Purchase
            </TabsTrigger>
            <TabsTrigger
              value="production"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Production
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stock" className="mt-4">
          <GranualsStockReport />
        </TabsContent>
        <TabsContent value="purchase" className="mt-4">
          <GranualsList />
        </TabsContent>
        <TabsContent value="production" className="mt-4">
          <GranualsToYarnProduction />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
