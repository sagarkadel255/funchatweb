"use client";

import { useEffect, useRef } from "react";

const EMOJIS = [
  ["😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😍","🥰","😘","😗","😚","😙","🙂","🤗","🤩","🤔","🤨","😐","😑","😶","🙄","😏","😣","😥","😮","🤐","😯","😪","😫","🥱","😴","😌","😛","😜","😝","🤤","😒","😓","😔","😕","🙃","🤑","😲","☹️","🙁","😖","😞","😟","😤","😢","😭","😦","😧","😨","😩","🤯","😬","😰","😱","🥵","🥶","😳","🤪","😵","🥴","😠","😡","🤬","😷","🤒","🤕","🤢","🤮","🤧","😇","🥳","🥸","🤠","🤡","🤥","🤫","🤭","🧐"],
  ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","💪","🦵","🦶","👂","🦻","👃","🫀","🫁","🧠","🦷","🦴","👀","👁️","👅","💋"],
  ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☯️"],
  ["⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","⛳","🎯","🎲","♟️","🎮","🕹️","🎰"],
  ["🍎","🍊","🍋","🍇","🍓","🍒","🍑","🥭","🍍","🥝","🍅","🫑","🥦","🧅","🥕","🌽","🌶️","🫒","🍄","🥜","🍞","🥐","🥖","🥨","🧀","🍳","🥚","🍿","🧂","🥫","🍱","🍘","🍙","🍚","🍛","🍜","🍝","🍠","🍢","🍣","🍤","🍥","🥮","🍡","🥟","🥠","🥡","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🧁","🥧","🍫","🍬","🍭","🍮","🍯","☕","🍵","🍶","🍷","🍸","🍹","🍺","🥂"],
];

const LABELS = ["😊 Smileys","👋 Gestures","❤️ Hearts","⚽ Activities","🍕 Food"];

interface Props {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position:"absolute", bottom:"100%", right:0, marginBottom:8, zIndex:50,
      width:300, background:"#0f1e4a", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:16, boxShadow:"0 8px 40px rgba(0,0,0,0.6)",
      overflow:"hidden",
    }}>
      <div style={{ maxHeight:280, overflowY:"auto", padding:12 }}>
        {EMOJIS.map((group, gi) => (
          <div key={gi} style={{ marginBottom:12 }}>
            <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
              {LABELS[gi]}
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:2 }}>
              {group.map((emoji) => (
                <button key={emoji} onClick={() => onSelect(emoji)} style={{
                  width:32, height:32, fontSize:18, background:"none", border:"none",
                  cursor:"pointer", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"background 0.1s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}