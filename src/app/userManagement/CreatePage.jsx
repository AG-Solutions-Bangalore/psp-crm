import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { ContextPanel } from "@/lib/ContextPanel";
import { Button } from "@/components/ui/button";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import Page from "../dashboard/page";
import BASE_URL from "@/config/BaseUrl";

const CreatePage = () => {
  const [selectedPage, setSelectedPage] = useState("");
  const [selectedUrl, setSelectedUrl] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [userIds, setUserIds] = useState("1,2,3,4");
  const [status, setStatus] = useState("Active");
  const [availablePages, setAvailablePages] = useState([]);
  const navigate = useNavigate();
  const { fetchPagePermission } = useContext(ContextPanel);
  const { toast } = useToast();

  const getAllPages = () => {
    const pages = [];

    const extractPages = (items) => {
      items.forEach((item) => {
        if (item.url && item.url !== "#") {
          pages.push({
            title: item.title || item.name,
            url: item.url,
          });
        }
        if (item.items) {
          extractPages(item.items);
        }
      });
    };

    const sidebarData = {
      navMain: [
        {
          title: "Master",
          url: "#",
          items: [
            { title: "Company", url: "/master/branch" },
            { title: "State", url: "/master/state" },
            { title: "Bank", url: "/master/bank" },
            { title: "Scheme", url: "/master/scheme" },
            { title: "Country", url: "/master/country" },
            { title: "Container Size", url: "/master/containersize" },
            { title: "Payment TermsC", url: "/master/paymentTermC" },
            { title: "Description of Goods", url: "/master/descriptionGoods" },
            { title: "Bag Type", url: "/master/bagType" },
            { title: "Custom Description", url: "/master/customdescription" },
            { title: "Type", url: "/master/type" },
            { title: "Quality", url: "/master/quality" },
            { title: "Item", url: "/master/item" },
            { title: "Marking", url: "/master/marking" },
            { title: "Port of Loading", url: "/master/portofloading" },
            { title: "GR Code", url: "/master/grcode" },
            { title: "Product", url: "/master/product" },
            { title: "Product Description", url: "/master/productdescription" },
            { title: "Shipper", url: "/master/shipper" },
            { title: "Vessel", url: "/master/vessel" },
            { title: "Pre Recepits", url: "/master/prerecepits" },
            { title: "Purchase Product", url: "/master/purchase-product" },
            { title: "Vendor", url: "/master/vendor" },
            { title: "Buyer", url: "/master/buyer" },
          ],
        },
        {
          title: "Reports",
          url: "#",
          items: [
            { title: "BuyerR", url: "/report/buyer-report" },
            { title: "ContractR", url: "/report/contract-form" },
            { title: "Sales Accounts", url: "/report/sales-account-form" },
            { title: "DutyDrawBack", url: "/report/duty-drawback" },
            { title: "Sales Summary", url: "/report/sales-data-form" },
            {
              title: "Purchase Summary",
              url: "/report/monthwise-purchase-form",
            },
            {
              title: "Product Stock",
              url: "/report/product-stock",
            },
          ],
        },
        {
          title: "Purchase",
          url: "#",
          items: [
            { title: "Purchase Order", url: "/purchase-order" },
            { title: "Purchase", url: "/purchase/market-purchase" },
            { title: "Production", url: "/purchase/market-production" },
            { title: "Processing", url: "/purchase/market-processing" },
            { title: "Dispatch", url: "/purchase/market-dispatch" },
            {
              title: "Stock",
              url: "/purchase/stock",
            },
          ],
        },
        {
          title: "Payment",
          url: "#",
          items: [
            { title: "PaymentList", url: "/payment-payment-list" },
            { title: "PaymentPending", url: "/payment-payment-pending" },
            { title: "PaymentClose", url: "/payment-payment-close" },
          ],
        },
        {
          title: "Duty Drawback",
          url: "#",
          items: [
            { title: "Pending", url: "/dutydrawback/pending" },
            { title: "Received", url: "/dutydrawback/received" },
          ],
        },
      ],
      projects: [
        { name: "Dashboard", url: "/home" },
        { name: "Contract", url: "/contract" },
        { name: "Invoice", url: "/invoice" },
        { name: "Purchase Order", url: "/purchase-order" },
        { name: "Costing", url: "/costing" },
        { name: "Folder", url: "/folder" },
      ],
      userManagement: [
        { name: "User Management", url: "/userManagement" },
        { name: "UserType", url: "/user-type" },
      ],
    };

    // Extract pages from all sections
    extractPages(sidebarData.navMain);
    extractPages(
      sidebarData.projects.map((p) => ({ title: p.name, url: p.url }))
    );
    extractPages(
      sidebarData.userManagement.map((p) => ({ title: p.name, url: p.url }))
    );

    return pages;
  };

  useEffect(() => {
    const existingControls = JSON.parse(
      localStorage.getItem("pageControl") || "[]"
    );
    const allPages = getAllPages();

    const filteredPages = allPages.filter(
      (page) =>
        !existingControls.some(
          (control) =>
            control.page === page.title ||
            control.url === page.url.replace("/", "")
        )
    );

    setAvailablePages(["All", ...filteredPages.map((page) => page.title)]);
  }, []);

  const handlePageChange = (e) => {
    const page = e.target.value;
    setSelectedPage(page);

    if (page === "All") {
      const existingControls = JSON.parse(
        localStorage.getItem("pageControl") || "[]"
      );
      const allPages = getAllPages();

      const filteredPages = allPages.filter(
        (menuItem) =>
          !existingControls.some(
            (control) =>
              control.page === menuItem.title ||
              control.url === menuItem.url.replace("/", "")
          )
      );

      setSelectedItems(filteredPages);
      setSelectedUrl("");
    } else {
      const item = getAllPages().find((i) => i.title === page);
      if (item) {
        setSelectedUrl(item.url.replace("/", ""));
        setSelectedItems([item]);
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}/api/panel-create-usercontrol-new`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: async () => {
      await fetchPagePermission();
      toast({
        title: "Success",
        description: "Page control created successfully!",
      });
      navigate("/userManagement");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    let payloadData;

    if (selectedPage === "All") {
      payloadData = selectedItems.map((item) => ({
        page: item.title,
        url: item.url.replace("/", ""),
        userIds,
        status,
      }));
    } else {
      payloadData = [
        {
          page: selectedPage,
          url: selectedUrl,
          userIds,
          status,
        },
      ];
    }

    createMutation.mutate({ usercontrol_data: payloadData });
  };

  return (
    <Page>
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">Create Page Control</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page
              </label>
              <select
                value={selectedPage}
                onChange={handlePageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Page</option>
                {availablePages.map((page) => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <input
                type="text"
                value={selectedUrl}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User IDs
              </label>
              <input
                type="text"
                value={userIds}
                onChange={(e) => setUserIds(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <input
                type="text"
                value={status}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {selectedItems.length > 0 && (
            <div className="mt-8">
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page
                      </th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        URL
                      </th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User IDs
                      </th>
                      <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap border-b">
                          {item.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b">
                          {item.url.replace("/", "")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b">
                          {userIds}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b">
                          {status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={handleSubmit}
              disabled={!selectedPage || createMutation.isLoading}
              className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>

            {createMutation.isLoading && (
              <div className="mt-4 text-blue-600">Creating...</div>
            )}
            {createMutation.isError && (
              <div className="mt-4 text-red-600">
                Error: {createMutation.error.message}
              </div>
            )}
            {createMutation.isSuccess && (
              <div className="mt-4 text-green-600">
                Successfully created page control!
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default CreatePage;
