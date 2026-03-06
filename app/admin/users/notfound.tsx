export default function AdminUsersNotFound() {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-bold mb-2">User Not Found</h2>
        <p style={{ color: "var(--text-secondary)" }}>The user you're looking for doesn't exist.</p>
      </div>
    </div>
  );
}