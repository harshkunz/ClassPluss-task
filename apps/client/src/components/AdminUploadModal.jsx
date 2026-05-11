import { useMemo, useState } from "react";
import { API_BASE_URL, apiRequest } from "../services/api";

export default function AdminUploadModal({
  categories,
  onClose,
  onCreated,
  onCategoryCreated,
}) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
  const [file, setFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [message, setMessage] = useState("");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      if (!title || !categoryId || !file) {
        setMessage("Please fill all fields.");
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("categoryId", categoryId);
      formData.append("image", file);

      const response = await fetch(`${API_BASE_URL}/api/admin/templates`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      onCreated?.(data.template);
      onClose?.();
    } catch (error) {
      setMessage(error.message || "Upload failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setMessage("Enter a category name first.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const data = await apiRequest("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const created = {
        id: data.category._id,
        title: data.category.name,
        count: 0,
        slug: data.category.slug,
      };

      onCategoryCreated?.(created);
      setCategoryId(created.id);
      setNewCategoryName("");
      setMessage("Category created.");
    } catch (error) {
      setMessage(error.message || "Unable to create category.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 text-[#1c1b1f] shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#ff6f59]">
              Upload
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Add a new template</h2>
            <p className="mt-2 text-sm text-[#6f6c73]">
              Upload a new template image and assign it to a category.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-[#6f6c73]">
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Template title"
              className="rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[#2c5d63] focus:ring-4 focus:ring-[#2c5d63]/20"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#6f6c73]">
            Category
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[#2c5d63] focus:ring-4 focus:ring-[#2c5d63]/20"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-[#6f6c73]">
              New category
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder="Add new category"
                className="flex-1 rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[#2c5d63] focus:ring-4 focus:ring-[#2c5d63]/20"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={isSaving}
                className="rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-[#2c5d63]"
              >
                Create
              </button>
            </div>
          </div>
          <label className="grid gap-2 text-sm font-semibold text-[#6f6c73]">
            Image
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="rounded-xl border border-dashed border-black/20 bg-white px-4 py-3 text-sm"
            />
          </label>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-40 w-full rounded-2xl object-cover"
            />
          )}

          {message && (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="mt-2 w-full rounded-2xl bg-[#2c5d63] px-4 py-3 text-sm font-semibold text-white disabled:cursor-progress disabled:opacity-70"
          >
            {isSaving ? "Uploading..." : "Upload template"}
          </button>
        </form>
      </div>
    </div>
  );
}
