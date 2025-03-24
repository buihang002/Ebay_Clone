import React from "react";
import { useState, useEffect } from "react";
import { getOrders } from "@/services/orderService";
import { getProducts } from "@/services/productService";
import { getUsers } from "@/services/authService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Package, DollarSign, Calendar } from "lucide-react";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, productsData, usersData] = await Promise.all([
          getOrders(),
          getProducts(),
          getUsers(),
        ]);
        setOrders(ordersData);
        setProducts(productsData);
        setUsers(usersData);
        setSellers(usersData.filter((u) => u.role === "seller"));
        setBuyers(usersData.filter((u) => u.role === "buyer"));
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthlyRevenue = orders
    .filter((order) => {
      const orderDate = new Date(order.createdAt);
      return (
        orderDate.getMonth() === currentMonth &&
        orderDate.getFullYear() === currentYear
      );
    })
    .reduce((total, order) => total + order.totalAmount, 0);

  const recentOrders = [...orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const topProducts = [...products]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 bg-primary/10 p-2 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  ${totalRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  +12.5% from last month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 bg-primary/10 p-2 rounded-full">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  ${monthlyRevenue.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date().toLocaleString("default", { month: "long" })}{" "}
                  {currentYear}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 bg-primary/10 p-2 rounded-full">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {orders.filter((o) => o.orderStatus === "Delivered").length}{" "}
                  delivered
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-4 bg-primary/10 p-2 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {buyers.length} buyers, {sellers.length} sellers
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent-orders">
        <TabsList>
          <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
          <TabsTrigger value="top-products">Top Products</TabsTrigger>
        </TabsList>

        <TabsContent value="recent-orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Order #</th>
                      <th className="py-3 text-left">Date</th>
                      <th className="py-3 text-left">Customer</th>
                      <th className="py-3 text-left">Status</th>
                      <th className="py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td className="py-3">{order.id}</td>
                        <td className="py-3">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">{order.shippingAddress.name}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.orderStatus === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : order.orderStatus === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top-products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Rated Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Product</th>
                      <th className="py-3 text-left">Category</th>
                      <th className="py-3 text-left">Brand</th>
                      <th className="py-3 text-left">Rating</th>
                      <th className="py-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topProducts.map((product) => (
                      <tr key={product.id}>
                        <td className="py-3 font-medium">{product.title}</td>
                        <td className="py-3">ID: {product.categoryId}</td>
                        <td className="py-3">{product.brand}</td>
                        <td className="py-3">
                          <div className="flex items-center">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span>{product.rating}</span>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          ${product.price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
