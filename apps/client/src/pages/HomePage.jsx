import { useMemo, useState } from "react";
import "../styles/home.css";

const USER = {
  name: "Aanya Sharma",
  photo:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
};

const CATEGORIES = [
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

const TEMPLATES = [
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

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://localhost:5000";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("birthday");
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => template.category === activeCategory);
  }, [activeCategory]);

  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    const nextTemplate = TEMPLATES.find(
      (template) => template.category === categoryId
    );
    if (nextTemplate) {
      setSelectedTemplate(nextTemplate);
    }
  };

  const handleShare = async () => {
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
          name: USER.name,
          photoUrl: USER.photo,
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
    <div className="home-shell">
      <div className="home-bg">
        <div className="home-orbit" />
        <div className="home-noise" />
      </div>

      <header className="home-header">
        <div>
          <p className="home-kicker">ClassPlus Templates</p>
          <h1>Pick a template, personalize instantly.</h1>
          <p>
            Browse curated collections, then preview your name and photo on every
            design.
          </p>
        </div>
        <div className="user-chip">
          <img src={USER.photo} alt={USER.name} />
          <div>
            <span>Welcome back</span>
            <strong>{USER.name}</strong>
          </div>
        </div>
      </header>

      <section className="category-strip">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`category-pill ${
              activeCategory === category.id ? "is-active" : ""
            }`}
            onClick={() => handleCategoryChange(category.id)}
          >
            <span>{category.title}</span>
            <em>{category.count}</em>
          </button>
        ))}
      </section>

      <section className="home-grid">
        <div className="template-grid">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`template-card ${
                selectedTemplate.id === template.id ? "is-selected" : ""
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="template-media">
                <img src={template.image} alt={template.title} />
                <div className="overlay-badge">Live Preview</div>
                <div className="overlay-name">{USER.name}</div>
                <img
                  className="overlay-photo"
                  src={USER.photo}
                  alt={USER.name}
                />
              </div>
              <div className="template-meta">
                <h3>{template.title}</h3>
                <p>{CATEGORIES.find((c) => c.id === template.category)?.title}</p>
              </div>
            </button>
          ))}
        </div>

        <aside className="preview-panel">
          <div className="preview-header">
            <h2>Live preview</h2>
            <p>See your overlayed name and photo by default.</p>
          </div>
          <div className="preview-frame">
            <img src={selectedTemplate.image} alt={selectedTemplate.title} />
            <div className="preview-overlay">
              <span>{USER.name}</span>
              <img src={USER.photo} alt={USER.name} />
            </div>
          </div>
          <div className="preview-footer">
            <div>
              <h3>{selectedTemplate.title}</h3>
              <p>{CATEGORIES.find((c) => c.id === selectedTemplate.category)?.title}</p>
            </div>
            <div className="preview-actions">
              <button type="button" className="preview-secondary">
                Customize Template
              </button>
              <button
                type="button"
                className="preview-action"
                onClick={handleShare}
                disabled={isSharing}
              >
                {isSharing ? "Sharing..." : "Share"}
              </button>
            </div>
          </div>
          <div className="share-panel">
            <div>
              <h4>Share via</h4>
              <p>WhatsApp, Instagram, Email, and more using your device share sheet.</p>
            </div>
            <div className="share-status">
              <span>{shareMessage || "Your share link will appear here."}</span>
              {shareUrl && (
                <a href={shareUrl} target="_blank" rel="noreferrer">
                  View image
                </a>
              )}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
