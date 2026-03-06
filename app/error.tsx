"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",gap:16,background:"var(--bg-dark)" }}>
      <p style={{ color:"var(--text-primary)",fontSize:18,fontWeight:600 }}>Something went wrong</p>
      <button className="fc-btn" onClick={reset}>Try again</button>
    </div>
  );
}