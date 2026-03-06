// app/user/profile/page.tsx
"use client";

import { useState, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Save, Key, User, Mail, Phone, FileText, Eye, EyeOff, Shield, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useAuthContext } from "@/context/authcontext";
import toast from "react-hot-toast";
import { updateProfileSchema, UpdateProfileData, changePasswordSchema, ChangePasswordData } from "../schema";
import { getInitials } from "@/lib/utils/formatters";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/authstore";
import { getImageUrl } from "@/lib/utils/getimageurl";

const inputWrap: React.CSSProperties = { position: "relative" };
const iconStyle: React.CSSProperties = {
  position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
  width: 16, height: 16, color: "var(--text-muted)", pointerEvents: "none",
};

export default function ProfilePage() {
  const { user, setUser } = useAuthContext();

  const [tab, setTab] = useState<"profile" | "security">("profile");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profilePending, startProfile] = useTransition();
  const [passwordPending, startPassword] = useTransition();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const profileForm = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { bio: user?.bio || "", phone: user?.phone || "" },
  });

  const passwordForm = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be less than 5MB"); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const { updateUser } = useAuthStore();

  const onProfileSubmit = (values: UpdateProfileData) => {
    startProfile(async () => {
      try {
        const formData = new FormData();
        if (avatarFile) formData.append("profileImage", avatarFile);
        if (values.bio !== undefined) formData.append("bio", values.bio || "");
        if (values.phone !== undefined) formData.append("phone", values.phone || "");
        if (values.username !== undefined) formData.append("username", values.username || "");
        const result = await authApi.updateProfile(formData);
        if (!result.success) throw new Error(result.message || "Profile update failed");
        setUser(result.data);
        updateUser(result.data);
        setAvatarFile(null);
        setAvatarPreview(null);
        toast.success("Profile updated successfully!");
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Failed to update profile");
      }
    });
  };

  const onPasswordSubmit = (values: ChangePasswordData) => {
    startPassword(async () => {
      try {
        const result = await authApi.changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });
        if (!result.success) throw new Error(result.message || "Password change failed");
        toast.success("Password changed successfully!");
        passwordForm.reset();
      } catch (err: any) {
        toast.error(err.response?.data?.message || err.message || "Failed to change password");
      }
    });
  };

  const currentAvatar = avatarPreview || getImageUrl(user?.profileImage);

  return (
    <div style={{ padding: "28px 24px", maxWidth: 860, margin: "0 auto" }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26,
          background: "var(--gradient-primary)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          marginBottom: 4,
        }}>
          Profile Settings
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Manage your personal information and security settings
        </p>
      </div>

      {/* Avatar hero card */}
      <div style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 20, padding: "28px 28px",
        marginBottom: 22, position: "relative", overflow: "hidden",
      }}>
        {/* Ambient glow behind avatar */}
        <div style={{
          position: "absolute", top: -40, left: -40,
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", position: "relative" }}>
          {/* Avatar */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* Gradient ring */}
            <div style={{
              width: 120, height: 120, borderRadius: "50%", padding: 3,
              background: "var(--gradient-primary)",
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%",
                overflow: "hidden", background: "var(--bg-card)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {currentAvatar ? (
                  <Image
                    src={currentAvatar} alt="Profile"
                    width={114} height={114}
                    style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                ) : (
                  <div style={{
                    width: "100%", height: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 36, fontWeight: 800, color: "#fff",
                    background: "var(--gradient-primary)",
                  }}>
                    {getInitials(user?.username || "U")}
                  </div>
                )}
              </div>
            </div>
            {/* Camera button */}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{
                position: "absolute", bottom: 2, right: 2,
                width: 34, height: 34, borderRadius: "50%",
                background: "var(--gradient-primary)",
                border: "2px solid var(--bg-card)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff",
                boxShadow: "var(--shadow-glow-violet)",
              }}>
              <Camera size={15} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
          </div>

          {/* User info */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <h2 style={{
              fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20,
              color: "var(--text-primary)", marginBottom: 4,
            }}>
              {user?.username || "User"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 14 }}>
              {user?.email}
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{
                padding: "3px 12px",
                background: "rgba(79,156,249,0.12)", border: "1px solid rgba(79,156,249,0.2)",
                borderRadius: 999, fontSize: 11, fontWeight: 700,
                color: "var(--accent-blue)", letterSpacing: "0.05em",
              }}>
                {(user?.role || "User").toUpperCase()}
              </span>
              <span style={{
                padding: "3px 12px",
                background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 999, fontSize: 11, fontWeight: 700,
                color: "var(--accent-green)", letterSpacing: "0.03em",
              }}>
                ● {(user?.status || "offline").charAt(0).toUpperCase() + (user?.status || "offline").slice(1)}
              </span>
            </div>

            {avatarFile && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                <CheckCircle size={14} style={{ color: "var(--accent-green)" }} />
                <span style={{ color: "var(--accent-green)", fontSize: 12 }}>
                  New image selected — save to apply
                </span>
                <button type="button" onClick={resetAvatar} style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--accent-red)", fontSize: 12, textDecoration: "underline", padding: 0,
                }}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 4, padding: 4,
        background: "rgba(255,255,255,0.04)",
        borderRadius: 16, width: "fit-content", marginBottom: 24,
      }}>
        {[
          { key: "profile", label: "Profile", Icon: User },
          { key: "security", label: "Security", Icon: Shield },
        ].map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as any)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 20px", borderRadius: 12, border: "none",
              cursor: "pointer", fontSize: 14, fontWeight: 600,
              transition: "all 0.2s",
              background: tab === key ? "var(--gradient-primary)" : "transparent",
              color: tab === key ? "#fff" : "var(--text-secondary)",
            }}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile form */}
      {tab === "profile" ? (
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 20, padding: 28, marginBottom: 18,
          }}>
            <h3 style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 15, color: "var(--text-primary)", marginBottom: 22,
            }}>
              Personal Information
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* Username */}
              <div>
                <label className="fc-label">Username</label>
                <div style={inputWrap}>
                  <User style={iconStyle} />
                  <input
                    type="text"
                    className="fc-input"
                    style={{ paddingLeft: 40 }}
                    {...profileForm.register("username")}
                  />
                </div>
                {profileForm.formState.errors.username && (
                  <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>
                    {profileForm.formState.errors.username.message}
                  </p>
                )}
              </div>

              {/* Email (disabled) */}
              <div>
                <label className="fc-label">Email (cannot be changed)</label>
                <div style={inputWrap}>
                  <Mail style={iconStyle} />
                  <input
                    type="email" disabled value={user?.email || ""}
                    className="fc-input"
                    style={{ paddingLeft: 40, opacity: 0.5, cursor: "not-allowed" }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="fc-label">Phone Number</label>
                <div style={inputWrap}>
                  <Phone style={iconStyle} />
                  <input
                    type="tel"
                    className="fc-input"
                    style={{ paddingLeft: 40 }}
                    {...profileForm.register("phone")}
                  />
                </div>
                {profileForm.formState.errors.phone && (
                  <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>
                    {profileForm.formState.errors.phone.message}
                  </p>
                )}
              </div>

              {/* Bio — full width */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="fc-label">Bio</label>
                <div style={inputWrap}>
                  <FileText style={{ ...iconStyle, top: 16, transform: "none" }} />
                  <textarea
                    rows={4}
                    className="fc-input"
                    style={{ paddingLeft: 40, paddingTop: 12, resize: "none" }}
                    {...profileForm.register("bio")}
                  />
                </div>
                {profileForm.formState.errors.bio && (
                  <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>
                    {profileForm.formState.errors.bio.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit" disabled={profilePending} className="fc-btn"
              style={{ padding: "12px 28px", fontSize: 14, borderRadius: 14 }}>
              {profilePending ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  }} className="anim-spin" />
                  Saving…
                </>
              ) : (
                <><Save size={15} /> Save Profile</>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Security form */
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <div style={{
            background: "var(--bg-card)", border: "1px solid var(--border)",
            borderRadius: 20, padding: 28, marginBottom: 18,
          }}>
            <h3 style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 15, color: "var(--text-primary)", marginBottom: 6,
            }}>
              Change Password
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 22 }}>
              Use a strong password with letters, numbers, and symbols.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              {/* Current password */}
              <div>
                <label className="fc-label">Current Password</label>
                <div style={inputWrap}>
                  <Key style={iconStyle} />
                  <input
                    type={showCurrent ? "text" : "password"}
                    className="fc-input"
                    style={{ paddingLeft: 40, paddingRight: 44 }}
                    {...passwordForm.register("currentPassword")}
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: 0, display: "flex",
                  }}>
                    {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New password */}
              <div>
                <label className="fc-label">New Password</label>
                <div style={inputWrap}>
                  <Key style={iconStyle} />
                  <input
                    type={showNew ? "text" : "password"}
                    className="fc-input"
                    style={{ paddingLeft: 40, paddingRight: 44 }}
                    {...passwordForm.register("newPassword")}
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--text-muted)", padding: 0, display: "flex",
                  }}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm new password — full width */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label className="fc-label">Confirm New Password</label>
                <div style={inputWrap}>
                  <Key style={iconStyle} />
                  <input
                    type="password"
                    className="fc-input"
                    style={{ paddingLeft: 40 }}
                    {...passwordForm.register("confirmPassword")}
                  />
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p style={{ color: "var(--accent-red)", fontSize: 12, marginTop: 5 }}>
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Update button */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              type="submit" disabled={passwordPending} className="fc-btn"
              style={{ padding: "12px 28px", fontSize: 14, borderRadius: 14 }}>
              {passwordPending ? (
                <>
                  <span style={{
                    width: 16, height: 16, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
                  }} className="anim-spin" />
                  Updating…
                </>
              ) : (
                <><Key size={15} /> Update Password</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
