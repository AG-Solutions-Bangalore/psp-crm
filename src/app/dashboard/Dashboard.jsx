import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Factory, TrendingUp, Users, ShoppingCart } from "lucide-react";
import Page from "../page/page";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/axios";
import usetoken from "@/api/usetoken";
import { DASHBOARD } from "@/api";
import {
  ErrorComponent,
  LoaderComponent,
} from "@/components/LoaderComponent/LoaderComponent";
import moment from "moment";

const Dashboard = () => {
  const token = usetoken();
  const {
    data: dashboard,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await apiClient.get(`${DASHBOARD}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  if (isLoading) {
    return <LoaderComponent name="Dashboard Data" />;
  }

  if (isError) {
    return (
      <ErrorComponent
        message="Error Fetching Dashboard Data"
        refetch={refetch}
      />
    );
  }

  const getWasteColor = (percentage) => {
    if (percentage > 10) return "text-red-600";
    if (percentage > 7) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Page>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Production Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your manufacturing operations
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Vendors
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboard?.totalVendor || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Customers
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboard?.totalCustomer || 0}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Monthly Production
                  </p>
                  <p className="text-2xl font-bold">
                    {dashboard?.totalMonthlyProduction || 0} kg
                  </p>
                </div>
                <Factory className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Sales
                  </p>
                  <p className="text-2xl font-bold">
                    ₹{(dashboard?.totalMonthlySales || 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Production and Monthly sales */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Production and Sales</CardTitle>
              <CardDescription>
                Current month production and sales breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Production</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Granules</p>
                      <p className="font-medium">
                        {dashboard?.totalGranualsfromProduction || 0} kg
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Yarn</p>
                      <p className="font-medium">
                        {dashboard?.totalYarnFromProduction || 0} kg
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Fabric</p>
                      <p className="font-medium">
                        {dashboard?.totalFabricfromProduction || 0} kg
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Fabric Work
                      </p>
                      <p className="font-medium">
                        {dashboard?.totalFabricfromWorkProduction || 0} kg
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Sales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Yarn Sales
                      </p>
                      <p className="font-medium">
                        {dashboard?.totalMonthlySalesYarn || 0} kg
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Fabric Sales
                      </p>
                      <p className="font-medium">
                        {dashboard?.totalMonthlySalesFabric || 0} kg
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Production */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Production</CardTitle>
              <CardDescription>Latest production batches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recent_production > 0 ? (
                  dashboard?.recent_production?.map((production, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="w-full">
                        <div className="text-sm flex flex-row items-center justify-between w-full">
                          <span>{production.type}</span>
                          <span>
                            Batch : {production.batch?.split("-").pop()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {production.quantity} •{" "}
                          {moment(production.date).format("DD-MMM-YYYY")}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center md:h-40 text-sm text-muted-foreground">
                    <p>No Recent Production Found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Waste Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Management</CardTitle>
              <CardDescription>
                Production efficiency and waste tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboard?.wasteManagement &&
                  Object.entries(dashboard.wasteManagement).map(
                    ([process, data]) => (
                      <div key={process} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium capitalize">
                            {process}
                          </span>
                          <span
                            className={`font-bold ${getWasteColor(
                              parseFloat(data.waste_percent)
                            )}`}
                          >
                            {data.waste_percent}% waste
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Input: {data.input_kg} kg</span>
                          <span>Output: {data.output_kg} kg</span>
                          <span>Waste: {data.waste_kg} kg</span>
                        </div>
                        <Progress
                          value={100 - parseFloat(data.waste_percent)}
                          className="h-2"
                        />
                      </div>
                    )
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                Latest customer orders and revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboard?.recentSales > 0 ? (
                  dashboard?.recentSales?.map((sale, index) => (
                    <div
                      key={index}
                      className="flex items-center  justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{sale.vendor_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {sale.sales_type} •{" "}
                          {moment(sale.date).format("DD-MMM-YYYY")}
                        </p>
                      </div>
                      <div>
                        <Badge variant="outline">
                          ₹
                          {parseFloat(sale.sales_total_amount).toLocaleString()}
                        </Badge>
                        <p className="text-xs  text-end">
                          {" "}
                          Qty: {sale.quantity}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-center items-center md:h-40 text-sm text-muted-foreground">
                    <p>No Recent Sales Found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Page>
  );
};

export default Dashboard;
