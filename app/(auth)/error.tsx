"use client";
export default function AuthError({ reset }: { reset:()=>void }) {
  return (
    <div style={{ textAlign:"center", padding:40 }}>
      <p style={{ color:"#ef4444", marginBottom:16 }}>Auth error occurred</p>
      <button className="fc-btn" onClick={reset}>Try again</button>
    </div>
  );
}