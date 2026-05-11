import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/api";

const FALLBACK_USER = {
  name: "Aanya Sharma",
  photo:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
};

const FALLBACK_CATEGORIES = [
  {
    id: "birthday",
    title: "Birthday",
    count: 18,
  },
  {
    id: "anniversary",
    title: "Anniversary",
    count: 12,
  },
  {
    id: "festivals",
    title: "Festivals",
    count: 22,
  },
  {
    id: "gratitude",
    title: "Gratitude",
    count: 9,
  },
];

const FALLBACK_TEMPLATES = [
  {
    id: "t1",
    title: "Golden Glow",
    category: "birthday",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t2",
    title: "Blush Petals",
    category: "anniversary",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t3",
    title: "Neon Diwali",
    category: "festivals",
    image:
      "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t4",
    title: "Sunlit Bloom",
    category: "birthday",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t5",
    title: "Modern Spark",
    category: "festivals",
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t6",
    title: "Satin Rose",
    category: "anniversary",
    image:
      "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t7",
    title: "Festival Lights",
    category: "festivals",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "t8",
    title: "Soft Gratitude",
    category: "gratitude",
    image:
      "https://images.unsplash.com/photo-1459666644539-a9755287d6b0?auto=format&fit=crop&w=800&q=80",
  },
];

export default function HomePage({ user }) {
  const [activeCategory, setActiveCategory] = useState("birthday");
  const [selectedTemplate, setSelectedTemplate] = useState(
    FALLBACK_TEMPLATES[0]
  );
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [templates, setTemplates] = useState(FALLBACK_TEMPLATES);
  const [loadError, setLoadError] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const activeUser = {
    name: user?.name || FALLBACK_USER.name,
    photo: user?.profileImageUrl || user?.photo || FALLBACK_USER.photo,
  };

  useEffect(() => {
    let isMounted = true;

    const fetchTemplates = async () => {
      try {
        const [categoryData, templateData] = await Promise.all([
          apiRequest("/api/templates/categories"),
          apiRequest("/api/templates"),
        ]);

        if (!isMounted) return;

        const mappedCategories = (categoryData.categories || []).map(
          (category) => ({
            id: category._id,
            title: category.name,
            count: category.count || 0,
            slug: category.slug,
          })
        );

        const mappedTemplates = (templateData.templates || []).map(
          (template) => ({
            id: template._id,
            title: template.title,
            category: template.category?._id || template.category,
            categoryLabel: template.category?.name,
            image: template.imageUrl,
            overlayDefaults: template.overlayDefaults,
          })
        );

        if (mappedCategories.length > 0) {
          setCategories(mappedCategories);
          setActiveCategory(mappedCategories[0].id);
        }

        if (mappedTemplates.length > 0) {
          setTemplates(mappedTemplates);
          setSelectedTemplate(mappedTemplates[0]);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("Unable to load templates. Showing demo data.");
        }
      }
    };

    fetchTemplates();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => template.category === activeCategory);
  }, [activeCategory, templates]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    const nextTemplate = templates.find(
      (template) => template.category === categoryId
    );
    if (nextTemplate) {
      setSelectedTemplate(nextTemplate);
    }
  };

  const handleShare = async () => {
    if (!selectedTemplate?.id) {
      setShareMessage("Select a template before sharing.");
      return;
    }
    setIsSharing(true);
    setShareMessage("Rendering your share image...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/share/render`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          name: activeUser.name,
          photoUrl: activeUser.photo,
        }),
      });

      if (!response.ok) {
        throw new Error("Share render failed");
      }

      const data = await response.json();
      const imageUrl = data.imageUrl;

      setShareUrl(imageUrl);
      setShareMessage("Ready to share.");

      if (navigator.share) {
        await navigator.share({
          title: "ClassPlus Greeting",
          text: "Check out my personalized template!",
          url: imageUrl,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(imageUrl);
        setShareMessage("Link copied. Share it anywhere.");
      } else {
        setShareMessage("Copy this link to share.");
      }
    } catch (error) {
      setShareMessage("Unable to share right now. Try again in a moment.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f1219] text-[#f7f4ee]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-120px] top-[10%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(244,201,93,0.3),transparent_70%)] blur-md animate-[orbitPulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),radial-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:120px_120px,40px_40px] opacity-30" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-14">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4c95d]">
              ClassPlus Templates
            </p>
            <h1 className="mt-2 font-alt text-4xl font-semibold leading-tight sm:text-5xl">
              Pick a template, personalize instantly.
            </h1>
            <p className="mt-3 max-w-xl text-base text-[#b6b2ab]">
              Browse curated collections, then preview your name and photo on every
              design.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-[#171a22] px-4 py-2">
            <img
              src={activeUser.photo}
              alt={activeUser.name}
              className="h-11 w-11 rounded-full object-cover"
            />
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#b6b2ab]">
                Welcome back
              </span>
              <strong className="block text-sm font-semibold">
                {activeUser.name}
              </strong>
            </div>
          </div>
        </header>

        {loadError && (
          <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
          </p>
        )}

        <section className="mb-7 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === category.id
                  ? "bg-[#f4c95d] text-[#151515]"
                  : "bg-[#1d212b] text-[#f7f4ee]"
              }`}
              onClick={() => handleCategoryChange(category.id)}
            >
              <span>{category.title}</span>
              <em
                className={`rounded-full px-2 py-0.5 text-xs not-italic ${
                  activeCategory === category.id
                    ? "bg-black/20 text-[#151515]"
                    : "bg-[#f4c95d]/20 text-[#f4c95d]"
                }`}
              >
                {category.count}
              </em>
            </button>
          ))}
        </section>

        <section className="grid gap-8 lg:grid-cols-[2.2fr_1fr]">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`overflow-hidden rounded-2xl border transition ${
                  selectedTemplate.id === template.id
                    ? "border-[#f4c95d]/60 translate-y-[-4px]"
                    : "border-transparent"
                } bg-[#171a22] text-left shadow-[0_30px_60px_rgba(10,12,18,0.45)]`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                    Live Preview
                  </div>
                  <div className="absolute bottom-4 left-4 text-lg font-semibold drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
                    {activeUser.name}
                  </div>
                  <img
                    className="absolute bottom-4 right-4 h-14 w-14 rounded-full border-2 border-white object-cover"
                    src={activeUser.photo}
                    alt={activeUser.name}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-base font-semibold">{template.title}</h3>
                  <p className="mt-1 text-sm text-[#b6b2ab]">
                    {template.categoryLabel ||
                      categories.find((c) => c.id === template.category)?.title}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <aside className="grid gap-4 rounded-2xl border border-white/10 bg-[#171a22] p-5 shadow-[0_30px_60px_rgba(10,12,18,0.45)]">
            <div>
              <h2 className="text-xl font-semibold">Live preview</h2>
              <p className="mt-1 text-sm text-[#b6b2ab]">
                See your overlayed name and photo by default.
              </p>
            </div>
            <div className="relative h-72 overflow-hidden rounded-2xl">
              <img
                src={selectedTemplate.image}
                alt={selectedTemplate.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end gap-3 bg-gradient-to-b from-transparent via-black/10 to-black/60 p-5">
                <span className="text-2xl font-semibold">{USER.name}</span>
                <img
                  src={activeUser.photo}
                  alt={activeUser.name}
                  className="h-[70px] w-[70px] rounded-[24px] border-4 border-white object-cover"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{selectedTemplate.title}</h3>
                <p className="text-sm text-[#b6b2ab]">
                  {selectedTemplate.categoryLabel ||
                    categories.find((c) => c.id === selectedTemplate.category)?.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold"
                >
                  Customize Template
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#ff6f59] px-4 py-2 text-sm font-semibold text-white disabled:cursor-progress disabled:opacity-70"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? "Sharing..." : "Share"}
                </button>
              </div>
            </div>
            <div className="grid gap-2 rounded-2xl border border-white/10 bg-[#1d212b] p-4 text-sm text-[#b6b2ab]">
              <div>
                <h4 className="text-sm font-semibold text-[#f7f4ee]">Share via</h4>
                <p className="mt-1 text-xs text-[#b6b2ab]">
                  WhatsApp, Instagram, Email, and more using your device share
                  sheet.
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span>{shareMessage || "Your share link will appear here."}</span>
                {shareUrl && (
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#f4c95d]"
                  >
                    View image
                  </a>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
