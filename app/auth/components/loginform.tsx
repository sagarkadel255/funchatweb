"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Eye, EyeOff, Shield, Loader2 } from "lucide-react";
import Link from "next/link";
import { LoginData, loginSchema } from "../schema";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false, // Add this default value
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Login failed");
      }

      // Store token and user data
      if (result.token) {
        localStorage.setItem("token", result.token);
        sessionStorage.setItem("token", result.token);
        
        if (data.rememberMe) {
          localStorage.setItem("rememberMeToken", result.token);
        }
      }

      if (result.data) {
        const userData = {
          id: result.data._id,
          email: result.data.email,
          username: result.data.username,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          role: result.data.role,
          profileImage: result.data.profileImage,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        sessionStorage.setItem("user", JSON.stringify(userData));
      }

      // Redirect based on role
      if (result.data?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/home");
      }

    } catch (error: any) {
      console.error("Login error:", error);
      setErrorMessage(error.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center blur-xl opacity-40 pointer-events-none"
        style={{
          backgroundImage: "url('/images/background.png')",
          zIndex: 0,
        }}
      ></div>

      {/* Animated gradient blobs */}
      <div
        className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        style={{ zIndex: 1 }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
        style={{ zIndex: 1 }}
      ></div>

      {/* Main Container */}
      <div
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden relative"
        style={{ zIndex: 10 }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* LEFT SIDE */}
          <div className="lg:w-1/2 bg-gradient-to-r from-[#dff6f9] via-[#9ad9e5] to-[#5a8fd8] p-12 text-white flex flex-col justify-center items-center relative overflow-hidden">
            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-5xl font-bold">
                Welcome Back to
                <br />
                Funchat
              </h2>

              {/* Image Component */}
              <div className="relative w-64 h-64 mx-auto">
                <Image
                  src="/images/phone.png"
                  alt="Phone"
                  fill
                  className="rounded-2xl object-cover"
                  priority
                  loading="eager"
                />
              </div>

              <p className="text-xl opacity-90">
                Connect with friends and share moments
              </p>
            </div>
          </div>

          {/* RIGHT SIDE - Login Form */}
          <div className="lg:w-1/2 p-12 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Sign In to Your Account
                </h2>
                <p className="text-gray-500 mt-2">
                  Enter your credentials to continue
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* EMAIL */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* REMEMBER ME & FORGOT PASSWORD */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      {...register("rememberMe")}
                      type="checkbox"
                      id="rememberMe"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>

                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-70 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Sign Up Link */}
                <p className="text-center text-sm text-gray-600 pt-4">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-blue-600 font-semibold hover:text-blue-700"
                  >
                    Sign Up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}