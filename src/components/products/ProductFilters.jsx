import React from "react";
import { useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function ProductFilters({
  categories,
  brands,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  applyFilters,
}) {
  // Gọi applyFilters khi bộ lọc thay đổi
  useEffect(() => {
    applyFilters();
  }, [selectedBrands, priceRange, sortBy]);

  return (
    <div className="lg:w-1/4 space-y-6 bg-white border-r-2 p-6 dark:bg-gray-800">
      <div>
        <h2 className="text-lg font-semibold mb-2">Sort by</h2>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Price Range</h2>
        <Slider
          defaultValue={[0, 2000]}
          max={2000}
          step={10}
          value={priceRange}
          onValueChange={(value) => setPriceRange(value)}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <Input
            type="number"
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([Number(e.target.value), priceRange[1]])
            }
            className="w-24"
          />
          <span>to</span>
          <Input
            type="number"
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-24"
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Brand</h2>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) =>
                  setSelectedBrands(
                    checked
                      ? [...selectedBrands, brand]
                      : selectedBrands.filter((b) => b !== brand)
                  )
                }
              />
              <label
                htmlFor={`brand-${brand}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
