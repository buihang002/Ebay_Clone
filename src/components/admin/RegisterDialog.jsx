import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UserPlus, Store } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["buyer", "seller"]),
    storeInfo: z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
        totalSales: z.number().min(0).optional(),
      })
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterDialog() {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "buyer",
      storeInfo: {
        name: "",
        description: "",
        rating: 4.5,
        totalSales: 0,
      },
    },
  });

  const role = watch("role");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...userData } = data; // Loại bỏ confirmPassword bằng destructuring
      const formattedData = {
        ...userData,
        avatarUrl: `/images/avatars/${data.role}.png`,
        storeInfo: data.role === "seller" ? userData.storeInfo : undefined,
      };
      const success = await registerUser(formattedData);
      if (success) {
        toast.success("Account created successfully!");
        navigate("/login");
      } else {
        toast.error("Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create an Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword")}
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Account Type</Label>
            <Select
              onValueChange={(value) => setValue("role", value)}
              defaultValue="buyer"
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">I want to buy</SelectItem>
                <SelectItem value="seller">I want to sell</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            )}
          </div>
          {role === "seller" && (
            <div className="space-y-2 border p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-muted-foreground" />
                <Label>Store Information</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  placeholder="Your store name"
                  {...register("storeInfo.name")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  placeholder="Tell customers about your store"
                  {...register("storeInfo.description")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Initial Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    {...register("storeInfo.rating", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="totalSales">Total Sales</Label>
                  <Input
                    id="totalSales"
                    type="number"
                    {...register("storeInfo.totalSales", {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
