"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";

export default function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const submit = async (values: LoginData) => {
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("login", values);
      router.push("/dashboard");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image - Behind everything */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center blur-xl opacity-40 pointer-events-none"
        style={{ 
          backgroundImage: "url('/images/background.png')",
          zIndex: -1
        }}
      ></div>

      {/* Animated gradient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10">
        <div className="flex flex-col lg:flex-row">
          
          {/* LEFT SIDE */}
          <div className="lg:w-1/2 bg-gradient-to-r from-[#dff6f9] via-[#9ad9e5] to-[#5a8fd8] p-12 text-white flex flex-col justify-center items-center relative overflow-hidden">
            <div className="relative z-10 text-center space-y-8"></div>
            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-5xl font-bold">Welcome Back to<br />Funchat</h2>
              
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
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:w-1/2 p-12 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Sign In</h2>
                <p className="text-gray-500">Enter your credentials to continue</p>
              </div>

              <form onSubmit={handleSubmit(submit)} className="space-y-5">
                

                {/* EMAIL */}
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full pl-12 py-3 border rounded-xl outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register("password")}
                      type="password"
                      className="w-full pl-12 py-3 border rounded-xl outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    Remember me
                  </label>
                  <a href="#" className="text-purple-600 font-semibold hover:text-purple-700">
                    Forgot Password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || pending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition disabled:opacity-60"
                >
                  {isSubmitting || pending ? "Signing in..." : "Sign In"}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/auth/signup" className="text-purple-600 font-semibold hover:text-purple-700">
                    Create Account
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