export default function GlobalLoading() {
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"var(--bg-dark)" }}>
      <div style={{ width:40,height:40,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"var(--brand-blue)" }} className="anim-spin" />
    </div>
  );
}