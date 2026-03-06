import Link from "next/link";

export default function PublicHeader() {
  return (
    <nav className="flex items-center justify-between px-8 md:px-16 py-5 sticky top-0 z-50"
      style={{ background: "rgba(7,13,31,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ background: "var(--gradient-teal)" }}>💬</div>
        <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--accent-teal)" }}>
          FunChat
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/login" className="btn-secondary py-2 px-4 text-sm">Sign In</Link>
        <Link href="/signup" className="btn-primary py-2 px-4 text-sm">Get Started</Link>
      </div>
    </nav>
  );
}