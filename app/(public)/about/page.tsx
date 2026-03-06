import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen py-24 px-8" style={{ background: "var(--sidebar-dark)", color: "var(--text-primary)" }}>
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6" style={{ fontFamily: "var(--font-display)" }}>About FunChat</h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
          Built with love for real-time communication.
        </p>
        <Link href="/" className="btn-primary">← Back to Home</Link>
      </div>
    </div>
  );
}