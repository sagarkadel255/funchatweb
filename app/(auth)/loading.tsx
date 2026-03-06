export default function AuthLoading() {
  return <div style={{ display:"flex",justifyContent:"center",padding:60 }}>
    <div style={{ width:32,height:32,borderRadius:"50%",border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"var(--brand-blue)" }} className="anim-spin" />
  </div>;
}