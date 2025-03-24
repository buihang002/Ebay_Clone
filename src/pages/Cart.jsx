import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { getProductById } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalPrice } =
    useCart();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartProducts = async () => {
      setLoading(true);
      try {
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
        toast.error("Failed to load some cart items");
      } finally {
        setLoading(false);
      }
    };
    fetchCartProducts();
  }, [items]);

  const handleQuantityChange = (productId, newQuantity) => {
    const product = cartItems.find(
      (item) => item.product.id === productId
    )?.product;
    if (!product) return;
    if (newQuantity > product.stock) {
      toast.error(`Cannot add more than ${product.stock} of this item`);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    toast.success(`Removed ${productName} from cart`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-16 h-[70vh] flex flex-col items-center justify-center">
        <div className="flex justify-center mb-4">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added any items to your cart yet.
        </p>
        <Button asChild>
          <Link to="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-[70vh] overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">
                  Cart Items ({cartItems.length})
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Clear Cart
                </Button>
              </div>
            </div>
            <div className="divide-y">
              {cartItems.map(({ product, quantity, price }) => (
                <div key={product.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-2xl">🖼️</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <Link
                          to={`/products/${product.id}`}
                          className="font-medium hover:underline"
                        >
                          {product.title}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() =>
                            handleRemoveItem(product.id, product.title)
                          }
                        >
                          <Trash2 size={16} />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {product.brand}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              handleQuantityChange(product.id, quantity - 1)
                            }
                            disabled={quantity <= 1}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                product.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-14 h-7 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              handleQuantityChange(product.id, quantity + 1)
                            }
                            disabled={quantity >= product.stock}
                          >
                            +
                          </Button>
                        </div>
                        <div className="font-bold">
                          ${(price * quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="bg-card rounded-lg border shadow-sm p-4 sticky top-20">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${(totalPrice * 0.07).toFixed(2)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${(totalPrice + totalPrice * 0.07).toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              size="lg"
              onClick={proceedToCheckout}
            >
              Proceed to Checkout
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <div className="text-center mt-4">
              <Link
                to="/products"
                className="text-primary text-sm hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
