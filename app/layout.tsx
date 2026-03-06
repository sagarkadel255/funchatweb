import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/authcontext";
import { SocketProvider } from "@/lib/providers/socketprovider"; // Add this import

export const metadata: Metadata = {
  title: "FunChat – Chat. Connect. Have Fun.",
  description: "Real-time messaging, voice & video calls",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SocketProvider> {/* Add SocketProvider here */}
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#0f1e4a",
                  color: "#f0f4ff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  fontSize: "13px",
                },
                success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
                error:   { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
              }}
            />
          </SocketProvider> {/* Close SocketProvider */}
        </AuthProvider>
      </body>
    </html>
  );
}