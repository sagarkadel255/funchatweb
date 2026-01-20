"use client";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { RegisterData, registerSchema } from "../schema";

function SignupPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const submit = async (values: RegisterData) => {
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("register", values);
      router.push("/dashboard");
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image - Fixed positioning */}
      <div 
        className="fixed inset-0 w-full h-full bg-cover bg-center blur-xl opacity-40 pointer-events-none"
        style={{ 
          backgroundImage: "url('/images/background.png')",
          zIndex: 0
        }}
      ></div>

      {/* Animated gradient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ zIndex: 1 }}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ zIndex: 1 }}></div>

      {/* BACKGROUND IMAGE - Using regular div with background-image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 -z-10"
        style={{ backgroundImage: "url('/images/background.png')" }}
      ></div>

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden relative" style={{ zIndex: 10 }}>
        <div className="flex flex-col lg:flex-row">
          
          {/* LEFT SIDE */}
          <div className="lg:w-1/2 bg-gradient-to-r from-[#dff6f9] via-[#9ad9e5] to-[#5a8fd8] p-12 text-white flex flex-col justify-center items-center relative overflow-hidden">
            <div className="relative z-10 text-center space-y-8"></div>
            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-5xl font-bold">Connect, Chat,<br />Share Moments</h2>
              
              {/* Fixed Image Component */}
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
                <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
                <p className="text-gray-500">Start your journey with Funchat</p>
              </div>

              <form onSubmit={handleSubmit(submit)} className="space-y-5">
                {/* NAME */}
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register("name")}
                      className="w-full pl-12 py-3 border rounded-xl outline-none"
                      placeholder="sagar"
                    />
                  </div>
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>

                {/* EMAIL */}
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register("email")}
                      type="email"
                      className="w-full pl-12 py-3 border rounded-xl outline-none"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register("password")}
                      type="password"
                      className="w-full pl-12 py-3 border rounded-xl outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      {...register("confirmPassword")}
                      type="password"
                      className="w-full pl-12 py-3 border rounded-xl outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || pending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  {isSubmitting || pending ? "Creating account..." : "Create Account"}
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <a href="/auth/login" className="text-purple-600 font-semibold">Sign In</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;