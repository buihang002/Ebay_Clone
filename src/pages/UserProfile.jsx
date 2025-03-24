import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByUser } from "@/services/orderService";
import { getProductById } from "@/services/productService";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Package, Settings } from "lucide-react";

export default function UserProfile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const userOrders = await getOrdersByUser(user.id);
        const ordersWithProducts = await Promise.all(
          userOrders.map(async (order) => {
            const productsPromises = order.items.map(async (item) => {
              try {
                const product = await getProductById(item.productId);
                return { product: product || null, quantity: item.quantity };
              } catch (error) {
                console.error(
                  `Error fetching product ${item.productId}:`,
                  error
                );
                return { product: null, quantity: item.quantity };
              }
            });
            const products = await Promise.all(productsPromises);
            return { ...order, products };
          })
        );
        setOrders(ordersWithProducts);
      } catch (error) {
        console.error("Error fetching user orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Profile</h1>
      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-medium">{user.name}</h3>
                  <Badge className="mt-1">{user.role}</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                {user.role === "seller" && user.storeInfo && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Store Name
                      </p>
                      <p>{user.storeInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Store Description
                      </p>
                      <p>{user.storeInfo.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Store Rating
                      </p>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{user.storeInfo.rating}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Sales
                      </p>
                      <p>{user.storeInfo.totalSales} items sold</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View your past orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">
                    You haven't placed any orders yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="bg-muted p-4">
                        <div className="flex flex-wrap justify-between items-center">
                          <div>
                            <p className="font-medium">Order #{order.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                order.orderStatus === "Delivered"
                                  ? "default"
                                  : order.orderStatus === "Shipped"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {order.orderStatus}
                            </Badge>
                            <Badge
                              variant={
                                order.paymentStatus === "Paid"
                                  ? "default"
                                  : "outline"
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="space-y-2">
                          {order.products.map(({ product, quantity }, index) =>
                            product ? (
                              <div
                                key={index}
                                className="flex justify-between items-center"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                                    <span>🖼️</span>
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {product.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Qty: {quantity}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-medium">
                                  ${(product.price * quantity).toFixed(2)}
                                </p>
                              </div>
                            ) : (
                              <div
                                key={index}
                                className="text-muted-foreground italic"
                              >
                                Product no longer available
                              </div>
                            )
                          )}
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span className="font-bold">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Shipping Address</p>
                          <p className="text-sm text-muted-foreground">
                            {order.shippingAddress.name},{" "}
                            {order.shippingAddress.street},{" "}
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state}{" "}
                            {order.shippingAddress.zipCode},{" "}
                            {order.shippingAddress.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Account settings functionality coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
