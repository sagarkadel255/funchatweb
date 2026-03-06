"use client";

interface Props {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

const sizes = { sm: 20, md: 32, lg: 48 };

export default function LoadingSpinner({ size = "md", fullScreen }: Props) {
  const px = sizes[size];
  const spinner = (
    <div
      className="anim-spin"
      style={{
        width: px, height: px, borderRadius: "50%",
        border: "3px solid rgba(255,255,255,0.1)",
        borderTopColor: "var(--brand-blue)",
        flexShrink: 0,
      }}
    />
  );

  if (fullScreen) {
    return (
      <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"var(--bg-dark)" }}>
        {spinner}
      </div>
    );
  }
  return spinner;
}