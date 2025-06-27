import Page from "@/app/page/page";
import RawMaterialList from "@/app/rawmaterial/RawMaterialList";
import RawMaterialProduction from "@/app/rawmaterialproduction/RawMaterialProduction";
import RawMaterialReport from "@/app/report/stock/RawMaterialReport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setRawMaterialTab } from "@/redux/slices/rawtabSlice";
import { useDispatch, useSelector } from "react-redux";

export function RawMaterialTabs() {
  const dispatch = useDispatch();

  const activeTab = useSelector((state) => state.tab.rawMaterialTab || "stock");

  const handleTabChange = (value) => {
    dispatch(setRawMaterialTab(value));
  };

  return (
    <Page>
      <div className="text-left text-2xl text-gray-800 font-[400] ml-2">
        Raw Material
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
              value="rawmaterial"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Purchase
            </TabsTrigger>
            <TabsTrigger
              value="rawmaterialproductionform"
              className="px-4 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              Production
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="stock" className="mt-4">
          <RawMaterialReport />
        </TabsContent>
        <TabsContent value="rawmaterial" className="mt-4">
          <RawMaterialList />
        </TabsContent>
        <TabsContent value="rawmaterialproductionform" className="mt-4">
          <RawMaterialProduction />
        </TabsContent>
      </Tabs>
    </Page>
  );
}
