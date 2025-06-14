import React, { useState } from "react";
import PreshipmentDetails from "./PreshipmentDetails";
import InvoiceView from "./InvoiceView";
import Page from "../dashboard/page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvoiceSpiceBoard from "./InvoiceSpiceBoard";
import InvoiceApta from "./InvoiceApta";
import InvoiceCertificateOrigin from "./InvoiceCertificateOrigin";
import InvoiceGst from "./InvoiceGst";
import BuyerInvoice from "./BuyerInvoice";
import PerfomaInvoice from "./PerfomaInvoice";
import BlDraft from "./BlDraft";
import InvoicePytho from "./InvoicePytho";
import InvoiceTripartite from "./InvoiceTripartite";
import { StepBack, StepForward } from "lucide-react";


const TABS = [
  { value: "pending", label: "Pre_Shipment", component: PreshipmentDetails },
  { 
    value: "invoice_packing",
    label: "Invoice Packing ECGC",
    component: InvoiceView,
  },
  { value: "spice_board", label: "Spice Board", component: InvoiceSpiceBoard },
  { value: "apta", label: "Apta", component: InvoiceApta },
  {
    value: "certificate_origin",
    label: "Cer. Origin",
    component: InvoiceCertificateOrigin,
  },
  { value: "invoice_gst", label: "Invoice Gsts", component: InvoiceGst },
  { value: "tripartite", label: "Tripartite", component: InvoiceTripartite },
  { value: "bldraft", label: "Bl Draft", component: BlDraft },
  { value: "buyerinvoice", label: "Buyer Invoice", component: BuyerInvoice },
  {
    value: "performainvoice",
    label: "Performa Invoice",
    component: PerfomaInvoice,
  },
  { value: "pytho", label: "Pytho", component: InvoicePytho },
 
];

const InvoiceTabs = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [sidebarOpen, setSidebarOpen] = useState(true); 

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen); 
  };

  return (
    <Page>
      <div className="relative flex w-full">
        <div
          className={`${
            sidebarOpen ? "w-[85%]" : "w-[100%]"
          } overflow-x-auto overflow-scroll p-2 transition-all duration-300`}
        >
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full"
              >
                {TABS.map(({ value, component: Component }) => (
                  <TabsContent key={value} value={value}>
                    <Component />
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </div>

        {/* Right Sidebar - 15% width */}
        <div
          className={`fixed right-0 top-20 h-[90vh]  bg-white  rounded-lg transition-all duration-300 ${
            sidebarOpen ? "w-[15%] p-2 border border-gray-200" : "w-0 p-0"
          }`}
        >
          
          <div className="flex flex-col h-full overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              orientation="vertical"
              className="w-full h-full"
            >
              
              <TabsList className="flex flex-col w-full h-full space-y-2 overflow-y-auto justify-start">
                {TABS.map(({ value, label }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="w-full px-4 py-2 text-sm font-medium transition duration-300 rounded-md data-[state=active]:bg-yellow-500 data-[state=inactive]:bg-blue-400 data-[state=active]:text-white  data-[state=inactive]:text-black data-[state=inactive]:hover:bg-gray-200 shrink-0"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Toggle Button for Sidebar */}
        <div
          onClick={toggleSidebar}
          className="fixed bottom-5 right-5 bg-blue-500 text-black p-2 rounded-full cursor-pointer shadow-lg transition duration-300 hover:bg-yellow-600"
        >
          {sidebarOpen ? <StepForward /> : <StepBack />}
        </div>

        {/* <div className="w-[15%]" /> */}
      </div>
    </Page>
  );
};

export default InvoiceTabs;
// sa//