import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { createProduct } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { PlusCircle, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductDialog() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [features, setFeatures] = useState([]);
  const [specifications, setSpecifications] = useState({});
  const [specificationKeys, setSpecificationKeys] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    discountPercentage: 0,
    rating: 0,
    stock: 0,
    brand: "",
    categoryId: "",
    sellerId: user?.id, // Gán mặc định, cập nhật dựa trên user đăng nhập
    thumbnail: "",
    images: [],
    features: [],
    specifications: {},
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        const uniqueBrands = ["Samsung", "Apple", "Sony", "LG", "Dell"]; // Giả lập danh sách brands
        setBrands(uniqueBrands);
      } catch (error) {
        console.error("Error fetching categories and brands:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = [
      "price",
      "discountPercentage",
      "rating",
      "stock",
    ].includes(name)
      ? parseFloat(value)
      : value;
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleCategoryChange = (categoryId) => {
    setFormData({ ...formData, categoryId });
  };

  const handleBrandChange = (brand) => {
    setFormData({ ...formData, brand });
  };

  // Handle Features
  const handleAddFeature = () => {
    setFeatures([...features, ""]);
  };

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    setFeatures(updatedFeatures);
  };

  // Improved specification handling
  const handleAddSpecification = () => {
    const newId = `spec-${Object.keys(specifications).length + 1}`;
    setSpecifications({ ...specifications, [newId]: "" });
    setSpecificationKeys({ ...specificationKeys, [newId]: "" });
  };

  const handleSpecKeyChange = (specId, keyValue) => {
    setSpecificationKeys({ ...specificationKeys, [specId]: keyValue });
  };

  const handleSpecValueChange = (specId, value) => {
    setSpecifications({ ...specifications, [specId]: value });
  };

  const handleRemoveSpecification = (specId) => {
    const updatedSpecs = { ...specifications };
    const updatedSpecKeys = { ...specificationKeys };
    delete updatedSpecs[specId];
    delete updatedSpecKeys[specId];
    setSpecifications(updatedSpecs);
    setSpecificationKeys(updatedSpecKeys);
  };

  const handleSubmit = async () => {
    if (
      !formData.title ||
      !formData.price ||
      !formData.categoryId ||
      !formData.brand
    ) {
      toast.error("Please fill in required fields.");
      return;
    }

    const finalSpecifications = {};
    Object.keys(specifications).forEach((specId) => {
      const actualKey = specificationKeys[specId] || specId;
      const value = specifications[specId];
      if (actualKey && value) {
        finalSpecifications[actualKey] = value;
      }
    });

    const formattedData = {
      ...formData,
      features,
      specifications: finalSpecifications,
      images:
        formData.images.length > 0
          ? formData.images
          : [formData.thumbnail, formData.thumbnail, formData.thumbnail],
    };

    const success = await createProduct(formattedData);
    if (success) {
      toast.success("Product created successfully!");
    } else {
      toast.error("Failed to create product.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a New Product</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-2">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Features</Label>
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveFeature(index)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddFeature} className="mt-2">
                <Plus size={16} className="mr-2" />
                Add Feature
              </Button>
            </div>
            <div>
              <Label>Specifications</Label>
              {Object.keys(specifications).map((specId) => (
                <div key={specId} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Specification Key"
                    value={specificationKeys[specId] || ""}
                    onChange={(e) =>
                      handleSpecKeyChange(specId, e.target.value)
                    }
                  />
                  <Input
                    placeholder="Specification Value"
                    value={specifications[specId]}
                    onChange={(e) =>
                      handleSpecValueChange(specId, e.target.value)
                    }
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveSpecification(specId)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              <Button onClick={handleAddSpecification} className="mt-2">
                <Plus size={16} className="mr-2" />
                Add Specification
              </Button>
            </div>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
