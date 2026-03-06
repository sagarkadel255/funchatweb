'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/authstore";
import LandingPage from "./_components/landingpage";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, user, initFromStorage } = useAuthStore();

  useEffect(() => {
    initFromStorage();
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === "admin" ? "/admin" : "/user/dashboard");
    }
  }, [isAuthenticated, user]);

  // Show landing page for unauthenticated users; authenticated users get redirected above
  if (isAuthenticated && user) {
    return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"var(--bg-dark)" }}>
        <div style={{ width:40,height:40,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"var(--brand-blue)" }} className="anim-spin" />
      </div>
    );
  }

  return <LandingPage />;
}