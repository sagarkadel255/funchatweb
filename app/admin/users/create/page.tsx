import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateUserForm from "../_componenrts/createuserform";

export default function CreateUserPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm mb-6 hover:opacity-80 transition-opacity"
        style={{ color: "var(--text-secondary)" }}>
        <ArrowLeft className="w-4 h-4" />
        Back to Users
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Create New User
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Add a new user account to the platform
        </p>
      </div>

      {/* Form card */}
      <div className="fc-card-dark">
        <CreateUserForm />
      </div>
    </div>
  );
}