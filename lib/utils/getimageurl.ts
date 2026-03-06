const MEDIA_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

/**
 * Converts a raw profile-image path from the backend into a fully-qualified URL
 * that Next.js <Image> (and regular <img>) can load.
 *
 * The backend (Node/Windows) stores paths like:
 *   "uploads\profiles\profileImage-1234.png"
 *
 * This normalises them to:
 *   "http://localhost:5000/uploads/profiles/profileImage-1234.png"
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  // Already a full URL — return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Normalise Windows back-slashes to forward slashes
  const normalized = path.replace(/\\/g, "/");
  // Ensure a leading slash
  const withSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${MEDIA_BASE}${withSlash}`;
}