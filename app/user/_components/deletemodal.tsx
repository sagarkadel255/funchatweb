"use client";

import { Trash2, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  description?: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, loading, title = "Are you sure?", description = "This action cannot be undone." }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fc-modal-bg" onClick={onClose}>
      <div className="fc-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{
              width:42, height:42, borderRadius:12,
              background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <Trash2 size={20} style={{ color:"#ef4444" }} />
            </div>
            <h3 style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:17, color:"#fff" }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.4)",padding:4 }}>
            <X size={18} />
          </button>
        </div>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:14, marginBottom:24, lineHeight:1.6 }}>{description}</p>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} className="fc-btn-ghost" style={{ flex:1 }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="fc-btn-danger" style={{ flex:1 }}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}