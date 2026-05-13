import { useMemo, useState } from "react";
import { API_BASE_URL } from "../services/api";

export default function AdminUploadModal({
  onClose,
  onCreated,
}) {
  const [title, setTitle] = useState("");

  // fixed category
  const categoryId = "custom";

  const [file, setFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [msg, setMsg] =
    useState("");

  const previewUrl = useMemo(() => {
    if (!file) return "";

    return URL.createObjectURL(file);
  }, [file]);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMsg("");

    try {
      if (!title || !file) {
        setMsg(
          "Please fill all fields."
        );

        return;
      }

      const formData =
        new FormData();

      formData.append(
        "title",
        title
      );

      // always custom
      formData.append(
        "categoryId",
        "custom"
      );

      formData.append(
        "image",
        file
      );

      const response =
        await fetch(
          `${API_BASE_URL}/api/admin/templates`,
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Upload failed"
        );
      }

      // custom category always
      const createdTemplate = {
        ...data.template,

        category:
          "custom",

        categoryLabel:
          "Custom",
      };

      onCreated?.(
        createdTemplate
      );

      onClose?.();
    } catch (error) {
      setMsg(
        error.message ||
          "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">

      <div className="w-full max-w-xl bg-white rounded-2xl border border-green-100 shadow-lg p-6">

        {/* header */}

        <div className="flex items-start justify-between gap-4 flex-wrap">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
              Upload
            </p>

            <h2 className="text-2xl font-semibold mt-2 text-gray-800">
              Custom Template
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Upload your own greeting template.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-black border border-gray-200 rounded-xl text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        {/* form */}

        <form
          onSubmit={
            handleSubmit
          }
          className="mt-6 grid gap-4"
        >

          {/* title */}

          <label className="grid gap-2 text-sm text-gray-900">

            Template Name

            <input
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Enter template name"
              className="border text-black border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
          </label>

          {/* fixed category */}

          <div className="grid gap-2 text-sm text-gray-900">

            Category

            <div className="border border-gray-200 rounded-xl px-4 py-3 bg-green-50 text-green-700 font-medium">
              Custom
            </div>
          </div>

          {/* upload image */}

          <label className="grid gap-2 text-sm text-gray-900">

            Upload Image

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setFile(
                  e.target
                    .files?.[0] ||
                    null
                )
              }
              className="border border-dashed border-gray-300 rounded-xl px-4 py-3 bg-white text-sm"
            />
          </label>

          {/* preview */}

          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-52 object-cover rounded-2xl border"
            />
          )}

          {/* message */}

          {msg && (
            <div className="bg-green-50 border border-green-100 text-sm text-green-700 rounded-xl px-4 py-3">
              {msg}
            </div>
          )}

          {/* submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-3 text-sm"
          >
            {loading
              ? "Uploading..."
              : "Upload Template"}
          </button>
        </form>
      </div>
    </div>
  );
}