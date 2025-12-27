"use client";

import Link from "next/link";
import Image from "next/image";
import { Eye } from "lucide-react";
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
    <form
      onSubmit={handleSubmit(submit)}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#bfe7ef] via-[#7cc8e9] to-[#1ea0ff] relative overflow-hidden"
    >
      {/* Decorative Circle */}
      <div className="absolute -left-40 top-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-white/40 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 items-center px-8">
        {/* Left Content */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-extrabold text-[#0b2c5d] drop-shadow mb-4">
            Welcome to the Funchat
          </h1>

          <p className="text-2xl font-semibold text-gray-900 mb-8">
            Stay connected with <br /> Funchat Anytime
          </p>

          <Image
            src="/images/phone.png"
            alt="Phone Icon"
            width={350}
            height={350}
            className="drop-shadow-xl"
          />
        </div>

        {/* Login Card */}
        <div className="flex justify-center">
          <div className="w-full max-w-md bg-gradient-to-b from-[#5fa3dd] to-[#6c7a89] rounded-3xl p-8 shadow-2xl border border-black/20">
            <h2 className="text-2xl font-bold text-center text-black mb-2">
              Welcome Back
            </h2>
            <p className="text-center text-sm text-black/70 mb-6">
              Enter your credentials for login
            </p>

            {/* Google Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white rounded-full py-2 mb-6 shadow hover:scale-[1.02] transition"
            >
              <Image src="/images/google.png" alt="Google" width={20} height={20} />
              <span className="font-medium text-gray-700">
                Continue with Google
              </span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-[1px] bg-cyan-300"></div>
              <span className="text-white">Or</span>
              <div className="flex-1 h-[1px] bg-cyan-300"></div>
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="example@gmail.com"
              {...register("email")}
              className="w-full mb-2 px-4 py-2 rounded-full outline-none shadow-inner"
            />
            {errors.email && (
              <p className="text-xs text-red-600 mb-2">
                {errors.email.message}
              </p>
            )}

            {/* Password */}
            <div className="relative mb-2">
              <input
                type="password"
                placeholder="*** password ***"
                {...register("password")}
                className="w-full px-4 py-2 rounded-full outline-none shadow-inner pr-10"
              />
              <Eye className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 cursor-pointer" />
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mb-2">
                {errors.password.message}
              </p>
            )}

            {/* Remember & Signup */}
            <div className="flex items-center justify-between text-sm text-white mb-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                remember me
              </label>

              <span>
                Don’t have an account?{" "}
                <Link href="/auth/signup" className="text-red-500 font-semibold">
                  Signup
                </Link>
              </span>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || pending}
              className="w-full bg-gradient-to-r from-cyan-400 to-teal-500 text-black font-bold py-2 rounded-full text-lg shadow-lg hover:scale-[1.03] transition disabled:opacity-60"
            >
              {isSubmitting || pending ? "Logging in..." : "LOGIN"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
