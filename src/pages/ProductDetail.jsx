import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getProductById,
  getProductsByCategory,
} from "@/services/productService";
import { getCategoryById } from "@/services/categoryService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const productData = await getProductById(id);
        if (!productData) {
          navigate("/products");
          return;
        }
        setProduct(productData);
        setSelectedImage(productData.thumbnail);

        if (productData.categoryId) {
          const categoryData = await getCategoryById(productData.categoryId);
          setCategory(categoryData || null);

          const relatedProductsData = await getProductsByCategory(
            productData.categoryId
          );
          const filteredRelated = relatedProductsData
            .filter((p) => p.id !== id)
            .slice(0, 4);
          setRelatedProducts(filteredRelated);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        toast.error("Error loading product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id, navigate]);

  const handleQuantityChange = (value) => {
    if (value < 1) return;
    if (product && value > product.stock) {
      toast.error(`Sorry, only ${product.stock} items in stock`);
      return;
    }
    setQuantity(value);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, quantity);
    toast.success(
      `Added ${quantity} ${quantity === 1 ? "item" : "items"} to cart`
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button variant="default" asChild>
          <Link to="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-12">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {category && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/products?category=${category.slug}`}>
                    {category.name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          )}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span className="text-muted-foreground">{product.title}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square bg-muted relative mb-4 rounded-lg overflow-hidden">
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <img
                src={selectedImage || product.thumbnail}
                alt={product.title}
                className="object-contain h-full w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <div
                key={index}
                className="aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-colors hover:border-primary"
                onClick={() => setSelectedImage(image)}
              >
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <img
                    src={image}
                    alt={product.title}
                    className="object-contain h-full w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{product.brand}</Badge>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span>{product.rating}</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            <div className="text-muted-foreground mb-4">
              {product.description}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                ${product.price.toFixed(2)}
              </span>
              {product.discountPercentage > 0 && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    $
                    {(
                      product.price /
                      (1 - product.discountPercentage / 100)
                    ).toFixed(2)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-sm font-medium">
                    {product.discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          <Separator />

          <div>
            <div className="flex items-center mb-4">
              <span className="w-20">Quantity:</span>
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
                <span className="ml-4 text-sm text-muted-foreground">
                  {product.stock} available
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={handleAddToCart} className="w-full">
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="secondary"
                className="w-full"
              >
                Buy Now
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm text-muted-foreground">Brand</div>
              <div>{product.brand}</div>
              {Object.entries(product.specifications).map(([key, value]) => (
                <React.Fragment key={key}>
                  <div className="text-sm text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div>{value}</div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <Tabs defaultValue="features">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="features" className="p-4 border rounded-md mt-2">
            <ul className="list-disc list-inside space-y-1">
              {product.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent
            value="specifications"
            className="p-4 border rounded-md mt-2"
          >
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(product.specifications).map(([key, value]) => (
                <React.Fragment key={key}>
                  <div className="font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div>{value}</div>
                </React.Fragment>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="p-4 border rounded-md mt-2">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Shipping Information</h3>
                <p className="text-sm text-muted-foreground">
                  Free standard shipping on orders over $35. Estimated delivery
                  time: 3-5 business days.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Return Policy</h3>
                <p className="text-sm text-muted-foreground">
                  Returns accepted within 30 days of delivery. Item must be
                  unused and in original packaging.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((relProduct) => (
              <Card key={relProduct.id} className="overflow-hidden">
                <Link
                  to={`/products/${relProduct.id}`}
                  className="block h-40 overflow-hidden"
                >
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <img src={relProduct.thumbnail} alt="🖼️" />
                  </div>
                </Link>
                <CardContent className="p-3">
                  <div className="font-medium line-clamp-2 mb-1">
                    <Link to={`/products/${relProduct.id}`}>
                      {relProduct.title}
                    </Link>
                  </div>
                  <div className="text-sm font-bold">
                    ${relProduct.price.toFixed(2)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(relProduct.id, 1);
                      toast.success(`Added ${relProduct.title} to cart`);
                    }}
                  >
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
