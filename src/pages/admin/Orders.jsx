import React from "react";
import { useState, useEffect } from "react";
import { getOrders } from "@/services/orderService";
import { getUsers } from "@/services/authService";
import { getProductById } from "@/services/productService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, FileText, Eye, TrendingUp, ArrowUpDown } from "lucide-react";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [viewingOrder, setViewingOrder] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ordersData, usersData] = await Promise.all([
          getOrders(),
          getUsers(),
        ]);

        // Enhance orders with user data
        const enhancedOrders = await Promise.all(
          ordersData.map(async (order) => {
            const user = usersData.find((u) => u.id === order.userId);

            // Fetch product details for each order item
            const productDetails = await Promise.all(
              order.items.map(async (item) => {
                const product = await getProductById(item.productId);
                return { product: product || null, quantity: item.quantity };
              })
            );

            return {
              ...order,
              user,
              productDetails,
            };
          })
        );

        setOrders(enhancedOrders);
        setFilteredOrders(enhancedOrders);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = [...orders];

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter((order) => {
        return (
          order.id.toLowerCase().includes(lowerCaseSearch) ||
          order.user?.name.toLowerCase().includes(lowerCaseSearch) ||
          order.user?.email.toLowerCase().includes(lowerCaseSearch)
        );
      });
    }

    // Filter by order status
    if (statusFilter && statusFilter !== "all") {
      result = result.filter((order) => order.orderStatus === statusFilter);
    }

    // Apply sorting
    switch (sortOption) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "highest":
        result.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case "lowest":
        result.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, sortOption, orders]);

  const viewOrderDetails = (order) => {
    setViewingOrder(order);
    setIsOrderDetailsOpen(true);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    // In a real app, this would call an API
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return {
          ...order,
          orderStatus: newStatus,
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    toast.success(`Order status updated to: ${newStatus}`);

    // If we were viewing this order in the dialog, update it there too
    if (viewingOrder && viewingOrder.id === orderId) {
      setViewingOrder({
        ...viewingOrder,
        orderStatus: newStatus,
      });
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case "Processing":
        return <Badge variant="outline">Processing</Badge>;
      case "Shipped":
        return <Badge variant="secondary">Shipped</Badge>;
      case "Delivered":
        return <Badge variant="default">Delivered</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline">Pending</Badge>;
      case "Paid":
        return <Badge variant="default">Paid</Badge>;
      case "Failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "Refunded":
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <Tabs
          defaultValue="all"
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="Processing">Processing</TabsTrigger>
            <TabsTrigger value="Shipped">Shipped</TabsTrigger>
            <TabsTrigger value="Delivered">Delivered</TabsTrigger>
            <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order ID or customer..."
              className="pl-8 w-full md:w-[260px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="highest">Highest value</SelectItem>
              <SelectItem value="lowest">Lowest value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div>{order.shippingAddress.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                        {order.user?.email || "Unknown user"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getOrderStatusBadge(order.orderStatus)}
                  </TableCell>
                  <TableCell>
                    {getPaymentStatusBadge(order.paymentStatus)}
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        onValueChange={(value) =>
                          updateOrderStatus(order.id, value)
                        }
                        defaultValue={order.orderStatus}
                      >
                        <SelectTrigger className="h-8 w-auto border-none">
                          <FileText className="h-4 w-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Shipped">Shipped</SelectItem>
                          <SelectItem value="Delivered">Delivered</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order #{viewingOrder?.id}</DialogTitle>
            <DialogDescription>
              Placed on{" "}
              {viewingOrder &&
                new Date(viewingOrder.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {viewingOrder && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Order Status
                  </div>
                  <div className="flex items-center gap-2">
                    {getOrderStatusBadge(viewingOrder.orderStatus)}
                    <Select
                      onValueChange={(value) =>
                        updateOrderStatus(viewingOrder.id, value)
                      }
                      defaultValue={viewingOrder.orderStatus}
                    >
                      <SelectTrigger className="h-8 w-[160px]">
                        <SelectValue placeholder={viewingOrder.orderStatus} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    Payment Status
                  </div>
                  <div>{getPaymentStatusBadge(viewingOrder.paymentStatus)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Amount
                  </div>
                  <div className="text-xl font-bold">
                    ${viewingOrder.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="space-y-1">
                    <p>Name: {viewingOrder.shippingAddress.name}</p>
                    <p>Email: {viewingOrder.user?.email || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <div className="space-y-1">
                    <p>{viewingOrder.shippingAddress.name}</p>
                    <p>{viewingOrder.shippingAddress.street}</p>
                    <p>
                      {viewingOrder.shippingAddress.city},{" "}
                      {viewingOrder.shippingAddress.state}{" "}
                      {viewingOrder.shippingAddress.zipCode}
                    </p>
                    <p>{viewingOrder.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingOrder.productDetails &&
                        viewingOrder.productDetails.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {item.product ? (
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                                    <span>🖼️</span>
                                  </div>
                                  <div className="max-w-[300px]">
                                    <div className="font-medium">
                                      {item.product.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.product.brand}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground italic">
                                  Product unavailable
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right">
                              $
                              {item.product
                                ? item.product.price.toFixed(2)
                                : "N/A"}
                            </TableCell>
                            <TableCell className="text-right">
                              $
                              {item.product
                                ? (item.product.price * item.quantity).toFixed(
                                    2
                                  )
                                : "N/A"}
                            </TableCell>
                          </TableRow>
                        ))}
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell className="text-right font-medium">
                          Subtotal
                        </TableCell>
                        <TableCell className="text-right">
                          ${viewingOrder.totalAmount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell className="text-right font-medium">
                          Tax
                        </TableCell>
                        <TableCell className="text-right">
                          ${(viewingOrder.totalAmount * 0.07).toFixed(2)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell className="text-right font-medium">
                          Shipping
                        </TableCell>
                        <TableCell className="text-right">Free</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={2} />
                        <TableCell className="text-right font-medium">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          ${(viewingOrder.totalAmount * 1.07).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOrderDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-medium mb-4">Order Trends</h3>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold">{orders.length}</div>
              <div className="text-sm text-muted-foreground">Total Orders</div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-medium mb-4">Revenue Overview</h3>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold">
                $
                {orders
                  .reduce((sum, order) => sum + order.totalAmount, 0)
                  .toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
