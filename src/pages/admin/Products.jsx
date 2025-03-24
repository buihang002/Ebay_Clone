import React from "react";
import { useState, useEffect } from "react";
import { getProducts } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import ProductDialog from "@/components/admin/ProductDialog";
import ProductEditDialog from "@/components/admin/ProductEditDialog";
import { deleteProduct } from "@/services/productService";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching products data:", error);
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let result = [...products];
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(lowerCaseSearch) ||
          product.brand.toLowerCase().includes(lowerCaseSearch)
      );
    }
    if (categoryFilter && categoryFilter !== "all") {
      result = result.filter(
        (product) => product.categoryId === categoryFilter
      );
    }
    setFilteredProducts(result);
  }, [searchTerm, categoryFilter, products]);

  const handleDelete = async (id, title) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the product "${title}"?`
    );
    if (!isConfirmed) return;

    const success = await deleteProduct(id);
    if (success) {
      setProducts(products.filter((product) => product.id !== id));
      setFilteredProducts(
        filteredProducts.filter((product) => product.id !== id)
      );
      toast.success(`Product "${title}" deleted`);
    } else {
      toast.error(`Failed to delete product "${title}"`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <ProductDialog />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const category =
                    categories.find((c) => c.id === product.categoryId)?.name ||
                    "Unknown";
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                            {product.thumbnail ? (
                              <img src={product.thumbnail} alt="🖼️" />
                            ) : (
                              <span className="text-2xl">🖼️</span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.title}</span>
                            <span className="text-xs text-muted-foreground">
                              ID: {product.id}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>{category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {product.stock} in stock
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <ProductEditDialog productId={product.id} />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(product.id, product.title)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
