export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin-icon"
        style={{ borderColor: "var(--accent-blue)", borderTopColor: "transparent" }} />
    </div>
  );
}