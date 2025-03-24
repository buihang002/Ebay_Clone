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
import { editProduct, getProductById } from "@/services/productService";
import { getCategories } from "@/services/categoryService";
import { Edit, Plus, Trash2 } from "lucide-react";

export default function ProductEditDialog({ productId }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    features: [],
    specifications: {},
  });
  const [specificationKeys, setSpecificationKeys] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const product = await getProductById(productId);
        if (product) {
          setFormData(product);
          // Initialize specification keys from the product's specifications
          const initialSpecKeys = {};
          if (product.specifications) {
            Object.keys(product.specifications).forEach((key, index) => {
              const specId = `spec-${index}`;
              initialSpecKeys[specId] = key;
            });
          }
          setSpecificationKeys(initialSpecKeys);
        }
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching product or categories:", error);
      }
    };
    fetchData();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: ["price", "stock", "discountPercentage", "rating"].includes(name)
        ? Number(value)
        : value,
    });
  };

  const handleCategoryChange = (categoryId) => {
    setFormData({ ...formData, categoryId });
  };

  // Handle Features
  const handleAddFeature = () => {
    setFormData({ ...formData, features: [...(formData.features || []), ""] });
  };

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...(formData.features || [])];
    updatedFeatures[index] = value;
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleRemoveFeature = (index) => {
    const updatedFeatures = [...(formData.features || [])];
    updatedFeatures.splice(index, 1);
    setFormData({ ...formData, features: updatedFeatures });
  };

  // Handle Specifications with key-value pairs
  const handleAddSpecification = () => {
    const newId = `spec-${Object.keys(specificationKeys).length + 1}`;
    setFormData({
      ...formData,
      specifications: { ...formData.specifications, [newId]: "" },
    });
    setSpecificationKeys({ ...specificationKeys, [newId]: "" });
  };

  const handleSpecKeyChange = (specId, keyValue) => {
    setSpecificationKeys({ ...specificationKeys, [specId]: keyValue });
  };

  const handleSpecValueChange = (specId, value) => {
    setFormData({
      ...formData,
      specifications: { ...formData.specifications, [specId]: value },
    });
  };

  const handleRemoveSpecification = (specId) => {
    const updatedSpecifications = { ...formData.specifications };
    delete updatedSpecifications[specId];
    setFormData({ ...formData, specifications: updatedSpecifications });

    const updatedSpecKeys = { ...specificationKeys };
    delete updatedSpecKeys[specId];
    setSpecificationKeys(updatedSpecKeys);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.price || !formData.categoryId) {
      toast.error("Please fill in required fields.");
      return;
    }

    const finalSpecifications = {};
    Object.keys(formData.specifications || {}).forEach((specId) => {
      const actualKey = specificationKeys[specId] || specId;
      const value = formData.specifications[specId] || "";
      if (actualKey && value) {
        finalSpecifications[actualKey] = value;
      }
    });

    const updatedFormData = {
      ...formData,
      specifications: finalSpecifications,
    };
    const success = await editProduct(productId, updatedFormData);
    if (success) {
      toast.success("Product updated successfully!");
    } else {
      toast.error("Failed to update product.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-2">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="title">Product Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
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
                  value={formData.price || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock || ""}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="discountPercentage">Discount (%)</Label>
                <Input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  value={formData.discountPercentage || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="thumbnail">Thumbnail URL</Label>
              <Input
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail || ""}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                onValueChange={handleCategoryChange}
                defaultValue={formData.categoryId}
              >
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
              {formData.features?.map((feature, index) => (
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
              <Button
                variant="secondary"
                onClick={handleAddFeature}
                className="mt-2"
              >
                <Plus size={16} className="mr-2" />
                Add Feature
              </Button>
            </div>
            <div>
              <Label>Specifications</Label>
              {Object.keys(formData.specifications || {}).map((specId) => (
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
                    value={formData.specifications[specId] || ""}
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
              <Button
                variant="secondary"
                onClick={handleAddSpecification}
                className="mt-2"
              >
                <Plus size={16} className="mr-2" />
                Add Specification
              </Button>
            </div>
            <Button onClick={handleSubmit}>Update</Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
