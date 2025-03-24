import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allProducts = await getProducts();
        const allCategories = await getCategories();
        const topProducts = [...allProducts]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);
        setFeaturedProducts(topProducts);
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-xl font-semibold">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="w-full py-36 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center">
        <div className="mx-auto px-6 md:px-12 lg:px-20">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            WELCOME TO EBAY
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
            Discover endless possibilities. Shop electronics, fashion, home &
            garden, and more!
          </p>
          <div className="mt-6">
            <Button className="px-8 py-3 text-lg font-semibold bg-white text-blue-600 rounded-lg shadow-lg hover:bg-gray-100">
              Get Started
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-6">
        <h2 className="text-3xl font-semibold text-center mb-6">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="group"
            >
              <div className="border border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center transition-all hover:border-blue-500 hover:shadow-lg bg-white dark:bg-gray-800">
                <div className="flex justify-center items-center mb-3 h-16 text-4xl">
                  📦
                </div>
                <h3 className="font-medium text-lg group-hover:text-blue-500">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-6 py-6">
        <h2 className="text-3xl font-semibold text-center mb-6">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800 shadow-lg rounded-lg"
            >
              <Link to={`/products/${product.id}`} className="overflow-hidden">
                <div className="h-56 overflow-hidden flex justify-center items-center bg-gray-100 dark:bg-gray-700">
                  <img
                    src={product.thumbnail}
                    alt="🖼️"
                    className="object-contain h-48"
                  />
                </div>
              </Link>
              <CardHeader className="p-4">
                <div className="flex justify-between">
                  <Badge className="bg-blue-500 text-white">
                    {product.brand}
                  </Badge>
                  <div className="flex items-center text-yellow-500">
                    ★{" "}
                    <span className="ml-1 text-lg font-bold">
                      {product.rating}
                    </span>
                  </div>
                </div>
                <CardTitle className="text-lg truncate mt-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="hover:text-blue-500"
                  >
                    {product.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 text-gray-600 dark:text-gray-300">
                <p className="line-clamp-2 text-sm">{product.description}</p>
              </CardContent>
              <CardFooter className="p-4 flex justify-between items-center border-t">
                <div className="font-bold text-lg text-blue-600">
                  ${product.price.toFixed(2)}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button
            asChild
            variant="outline"
            className="px-8 py-3 text-lg font-semibold border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
          >
            <Link to="/products">View All Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
