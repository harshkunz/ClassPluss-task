import { useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80";

export default function ProfileSetupModal({
  user,
  onComplete,
}) {
  const [fullName, setFullName] =
    useState(user?.name || "");

  const [photoUrl, setPhotoUrl] =
    useState(DEFAULT_AVATAR);

  const [loading, setLoading] =
    useState(false);

  const [err, setErr] =
    useState("");

  const avatarUrl = useMemo(() => {
    if (photoUrl) return photoUrl;

    if (user?.profileImageUrl) {
      return user.profileImageUrl;
    }

    return DEFAULT_AVATAR;
  }, [photoUrl, user]);

  function handlePhotoChange(event) {
    const file =
      event.target.files &&
      event.target.files[0];

    if (file) {
      const reader =
        new FileReader();

      reader.onload = () => {
        setPhotoUrl(
          typeof reader.result ===
            "string"
            ? reader.result
            : ""
        );
      };

      reader.readAsDataURL(file);
    }
  }

  async function handleSave() {
    setLoading(true);
    setErr("");

    try {
      const payload = {
        name:
          fullName || undefined,

        profileImageUrl:
          photoUrl || undefined,
      };

      const data = await apiRequest(
        "/api/auth/profile",
        {
          method: "PUT",
          body: JSON.stringify(
            payload
          ),
        }
      );

      onComplete?.(data.user);
    } catch (error) {
      setErr(
        error.message ||
          "Profile update failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

      <div className="w-full max-w-lg bg-white rounded-2xl border border-green-100 shadow-lg p-6">

        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Complete Profile
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Add your name and photo.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-4 bg-green-50 rounded-2xl p-4">

          <img
            src={avatarUrl}
            alt="preview"
            className="h-20 w-20 rounded-full object-cover border-4 border-white"
          />

          <div>
            <p className="text-sm text-gray-500">
              Preview
            </p>

            <h3 className="text-lg font-semibold text-gray-800">
              {fullName ||
                user?.name ||
                "Your Name"}
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4">

          <label className="grid gap-2 text-sm text-gray-900">
            Full Name

            <input
              type="text"
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              placeholder="Enter name"
              className="border text-black  border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </label>

          <label className="grid gap-2 text-sm text-gray-900">
            Upload Photo

            <input
              type="file"
              accept="image/*"
              onChange={
                handlePhotoChange
              }
              className="border border-dashed border-gray-300 rounded-xl px-4 py-3 text-sm"
            />
          </label>
        </div>

        {err && (
          <div className="mt-4 bg-red-50 border border-red-100 text-red-600 rounded-xl px-4 py-3 text-sm">
            {err}
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white rounded-xl py-3"
        >
          {loading
            ? "Saving..."
            : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}