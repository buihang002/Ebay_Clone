import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { getProductById } from "@/services/productService";
import { createOrder } from "@/services/orderService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, CircleDollarSign, Loader2 } from "lucide-react";

const shippingAddressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  country: z.string().min(2, "Country is required"),
});

const paymentSchema = z.object({
  paymentMethod: z.enum(["credit-card", "paypal"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

const checkoutSchema = z.object({
  shipping: shippingAddressSchema,
  payment: paymentSchema,
});

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shipping: {
        name: user?.name || "",
        country: "USA",
      },
      payment: {
        paymentMethod: "credit-card",
      },
    },
  });

  const paymentMethod = watch("payment.paymentMethod");

  useEffect(() => {
    const fetchCartProducts = async () => {
      setLoading(true);
      try {
        if (items.length === 0) {
          navigate("/cart");
          return;
        }
        const loadedItems = await Promise.all(
          items.map(async (item) => {
            const product = await getProductById(item.productId);
            if (!product)
              throw new Error(`Product not found: ${item.productId}`);
            return {
              product,
              quantity: item.quantity,
              price: item.price,
            };
          })
        );
        setCartItems(loadedItems);
      } catch (error) {
        console.error("Error fetching cart products:", error);
        toast.error("Failed to load checkout items");
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };
    fetchCartProducts();
  }, [items, navigate]);

  const onSubmit = async (data) => {
    if (!user) {
      toast.error("You must be logged in to complete checkout");
      navigate("/login");
      return;
    }
    setSubmitting(true);
    try {
      await createOrder(
        user.id,
        items,
        totalPrice,
        data.shipping,
        data.payment.paymentMethod === "credit-card" ? "Credit Card" : "PayPal"
      );
      clearCart();
      toast.success("Order placed successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <Button variant="default" asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const subtotal = totalPrice;
  const tax = subtotal * 0.07;
  const shippingCost = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + tax + shippingCost;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <Button
        variant="link"
        className="pl-0 mb-4"
        onClick={() => navigate("/cart")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Cart
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shipping.name">Full Name</Label>
                    <Input id="shipping.name" {...register("shipping.name")} />
                    {errors.shipping?.name && (
                      <p className="text-sm text-destructive">
                        {errors.shipping.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping.street">Street Address</Label>
                    <Input
                      id="shipping.street"
                      {...register("shipping.street")}
                    />
                    {errors.shipping?.street && (
                      <p className="text-sm text-destructive">
                        {errors.shipping.street.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping.city">City</Label>
                    <Input id="shipping.city" {...register("shipping.city")} />
                    {errors.shipping?.city && (
                      <p className="text-sm text-destructive">
                        {errors.shipping.city.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping.state">State/Province</Label>
                    <Input
                      id="shipping.state"
                      {...register("shipping.state")}
                    />
                    {errors.shipping?.state && (
                      <p className="text-sm text-destructive">
                        {errors.shipping.state.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping.zipCode">Zip/Postal Code</Label>
                    <Input
                      id="shipping.zipCode"
                      {...register("shipping.zipCode")}
                    />
                    {errors.shipping?.zipCode && (
                      <p className="text-sm text-destructive">
                        {errors.shipping.zipCode.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping.country">Country</Label>
                    <Select
                      defaultValue="USA"
                      onValueChange={(value) => {
                        register("shipping.country").onChange({
                          target: { name: "shipping.country", value },
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USA">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Mexico">Mexico</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.shipping?.country && (
                      <p className="text-sm text-destructive">
                        {errors.shipping.country.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  defaultValue="credit-card"
                  className="space-y-3"
                  onValueChange={(value) => {
                    register("payment.paymentMethod").onChange({
                      target: { name: "payment.paymentMethod", value },
                    });
                  }}
                >
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="credit-card" id="credit-card" />
                    <Label htmlFor="credit-card">Credit Card</Label>
                    <CreditCard className="ml-auto h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal">PayPal</Label>
                    <CircleDollarSign className="ml-auto h-4 w-4 text-muted-foreground" />
                  </div>
                </RadioGroup>
                {paymentMethod === "credit-card" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="payment.cardNumber">Card Number</Label>
                      <Input
                        id="payment.cardNumber"
                        placeholder="1234 5678 9012 3456"
                        {...register("payment.cardNumber")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment.cardExpiry">Expiry Date</Label>
                      <Input
                        id="payment.cardExpiry"
                        placeholder="MM/YY"
                        {...register("payment.cardExpiry")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment.cardCvc">CVC</Label>
                      <Input
                        id="payment.cardCvc"
                        placeholder="123"
                        {...register("payment.cardCvc")}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="lg:hidden">
              <OrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                tax={tax}
                shippingCost={shippingCost}
                total={total}
                isSubmitting={submitting}
              />
            </div>
          </form>
        </div>
        <div className="hidden lg:block">
          <OrderSummary
            cartItems={cartItems}
            subtotal={subtotal}
            tax={tax}
            shippingCost={shippingCost}
            total={total}
            isSubmitting={submitting}
            onSubmit={handleSubmit(onSubmit)}
          />
        </div>
      </div>
    </div>
  );
}

const OrderSummary = ({
  cartItems,
  subtotal,
  tax,
  shippingCost,
  total,
  isSubmitting,
  onSubmit,
}) => (
  <Card className="sticky top-20">
    <CardHeader>
      <CardTitle>Order Summary</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-3">
        {cartItems.map(({ product, quantity, price }) => (
          <div key={product.id} className="flex justify-between">
            <span className="text-sm">
              {product.title}{" "}
              <span className="text-muted-foreground">x{quantity}</span>
            </span>
            <span className="font-medium">
              ${(price * quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <Separator />
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span>
            {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button
        className="w-full"
        size="lg"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Place Order"
        )}
      </Button>
    </CardFooter>
  </Card>
);
