"use client";
export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--accent-red)" }}>Error</h2>
        <p className="mb-4 text-sm" style={{ color: "var(--text-secondary)" }}>{error.message}</p>
        <button onClick={reset} className="btn-primary">Try again</button>
      </div>
    </div>
  );
}