import { useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80";

export default function ProfileEditModal({
  user,
  onClose,
  onSaved,
}) {
  const [fullName, setFullName] = useState(
    user?.name || ""
  );

  const [photoUrl, setPhotoUrl] = useState(
    user?.profileImageUrl || ""
  );

  const [loading, setLoading] =
    useState(false);

  const [err, setErr] = useState("");

  const avatarUrl = useMemo(() => {
    if (photoUrl) return photoUrl;
    return DEFAULT_AVATAR;
  }, [photoUrl]);

  function handlePhotoChange(event) {
    const file =
      event.target.files &&
      event.target.files[0];

    if (file) {
      const reader = new FileReader();

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

      onSaved?.(data.user);

      onClose?.();
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

        <div className="flex items-start justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
              Profile
            </p>

            <h2 className="text-2xl font-semibold mt-2 text-gray-800">
              Edit Profile
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Update your details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border text-black border-gray-200 rounded-xl text-sm hover:bg-gray-50"
          >
            Close
          </button>
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

            <h3 className="text-lg font-semibold text-gray-900">
              {fullName ||
                "Your Name"}
            </h3>
          </div>
        </div>

        <div className="mt-6 grid gap-4">

          <label className="grid gap-2 text-sm text-gray-900">
            Full Name

            <input
              type="text"
              placeholder="Enter name"
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              className="border text-black border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </label>

          <label className="grid gap-2 text-sm text-gray-900">
            Profile Photo

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
          className="w-full text-sm mt-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl py-3"
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>
      </div>
    </div>
  );
}