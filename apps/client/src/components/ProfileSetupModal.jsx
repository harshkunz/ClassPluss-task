import { useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80";

export default function ProfileSetupModal({ user, onComplete }) {
  const [fullName, setFullName] = useState(user?.name || "");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const avatarUrl = useMemo(() => {
    if (photoUrl) return photoUrl;
    if (user?.profileImageUrl) return user.profileImageUrl;
    return DEFAULT_AVATAR;
  }, [photoUrl, user]);

  const handlePhotoChange = (event) => {
    const file = event.target.files && event.target.files[0];
    setPhotoFile(file || null);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(typeof reader.result === "string" ? reader.result : "");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage("");

    try {
      const payload = {
        name: fullName || undefined,
        profileImageUrl: photoUrl || undefined,
      };

      const data = await apiRequest("/api/auth/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      onComplete?.(data.user);
    } catch (error) {
      setErrorMessage(error.message || "Profile update failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-[#1c1b1f] shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Finish your profile</h2>
          <p className="mt-2 text-sm text-[#6f6c73]">
            Add your name and photo so every template preview is personalized.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl bg-[#f6efe9] p-4">
          <div className="h-[86px] w-[86px] rounded-[28px] bg-gradient-to-br from-[#f7724e] to-[#2c5d63] p-1">
            <img
              src={avatarUrl}
              alt="Profile preview"
              className="h-full w-full rounded-[24px] border-4 border-white object-cover"
            />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#2c5d63]">
              Preview
            </span>
            <h3 className="mt-1 text-lg font-semibold">
              {fullName || user?.name || "Your Name"}
            </h3>
            <p className="text-sm text-[#6f6c73]">
              This will appear on your shared greeting.
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-[#6f6c73]">
            Full name
            <input
              type="text"
              placeholder="Enter your name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[#2c5d63] focus:ring-4 focus:ring-[#2c5d63]/20"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#6f6c73]">
            Profile photo
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="rounded-xl border border-dashed border-black/20 bg-white px-4 py-3 text-sm"
            />
          </label>
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="mt-6 w-full rounded-2xl bg-[#2c5d63] px-5 py-3 text-base font-semibold text-white disabled:cursor-progress disabled:opacity-70"
        >
          {isSaving ? "Saving..." : "Save and continue"}
        </button>
      </div>
    </div>
  );
}
