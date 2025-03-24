import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ProductGrid({ products }) {
  return (
    <div className="lg:w-3/4 my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className="overflow-hidden flex flex-col h-full"
          >
            <Link to={`/products/${product.id}`} className="overflow-hidden">
              <div className="h-48 overflow-hidden">
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="object-cover h-48"
                    />
                  ) : (
                    <span className="text-2xl">🖼️</span>
                  )}
                </div>
              </div>
            </Link>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Badge>{product.brand}</Badge>
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="text-sm">{product.rating}</span>
                </div>
              </div>
              <CardTitle className="text-lg truncate">
                <Link to={`/products/${product.id}`}>{product.title}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <p className="text-muted-foreground line-clamp-2 text-sm">
                {product.description}
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild>
                <Link to={`/products/${product.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
