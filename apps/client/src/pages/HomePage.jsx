import { useEffect, useState } from "react";

import AdminUploadModal from "../components/AdminUploadModal";
import ProfileEditModal from "../components/ProfileEditModal";
import SubscriptionModal from "../components/SubscriptionModal";

import NavbarSection from "../components/NavbarSection";
import PreviewSection from "../components/PreviewSection";
import { apiRequest } from "../services/api";
import { FALLBACK_USER, FALLBACK_CATEGORIES, FALLBACK_TEMPLATES } from "../store/data";

export default function HomePage({ user, onLogout, onProfileUpdated }) {

  const [activeCategory, setActiveCategory] = useState( FALLBACK_CATEGORIES[0]?.id || "birthday");
  const [templates, setTemplates] = useState( FALLBACK_TEMPLATES);
  const [categories, setCategories] = useState( FALLBACK_CATEGORIES);
  const [selectedTemplate, setSelectedTemplate] = useState(FALLBACK_TEMPLATES[0]);

  const [plans, setPlans] = useState([]);
  const [loadError, setLoadError] = useState("");

  const [showUpsell, setShowUpsell] = useState(false);
  const [showAdminUpload, setShowAdminUpload] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [shareUrl, setShareUrl] = useState("");

  const activeUser = {
    name:
      user?.name ||
      FALLBACK_USER.name,

    photo:
      user?.profileImageUrl ||
      user?.photo ||
      FALLBACK_USER.photo,
  };

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [
          categoryData,
          templateData,
          planData,
          statusData,
        ] = await Promise.all([
          apiRequest("/api/templates/categories"),
          apiRequest("/api/templates"),
          apiRequest("/api/billing/plans"),
          apiRequest("/api/billing/status"),
        ]);

        if (!mounted) return;

        const newCategories = (categoryData.categories || []).map((item) => ({
          id: item._id,
          title: item.name,
          count: item.count || 0,
          slug: item.slug,
        }));

        const newTemplates = (templateData.templates || []).map((item) => ({
          id: item._id,
          title: item.title,
          category: item.category?._id || item.category,
          categoryLabel: item.category?.name,
          image: item.imageUrl,
          isPremium: item.isPremium || false,
        }));

        if (newCategories.length > 0) {
          setCategories((prev) => {
            const allCategories = [...prev, ];

            newCategories.forEach((cat) => {
              const exists = allCategories.find((item) => item.id === cat.id);
              if (!exists) allCategories.push(cat);
              
            });

            return allCategories;
          });
        }

        // merge templates with dummy templates
        if (newTemplates.length > 0) {
          setTemplates((prev) => {
            const allTemplates = [
              ...prev,
            ];

            newTemplates.forEach((temp) => {
              const exists =
                allTemplates.find(
                  (item) =>
                    item.id === temp.id
                );

              if (!exists) {
                allTemplates.push(temp);
              }
            });

            return allTemplates;
          });
        }

        setPlans(
          planData.plans || []
        );

        setIsPremiumUser(
          Boolean(statusData.isPremium)
        );
      } catch (error) {
        setLoadError(
          "Unable to load latest data. Showing demo templates."
        );
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // filtered templates
  const filteredTemplates =
    templates.filter(
      (item) =>
        item.category === activeCategory
    ) || FALLBACK_TEMPLATES;

  function handleCategoryChange(
    categoryId
  ) {
    setActiveCategory(categoryId);

    const nextTemplate =
      templates.find(
        (item) =>
          item.category === categoryId
      );

    if (nextTemplate) {
      setSelectedTemplate(
        nextTemplate
      );
    }
  }

  async function handleDeleteCategory(category) {
    if (!category?.id) return;

    const confirmed = window.confirm(
      `Delete ${category.title}? This will remove its uploaded templates too.`
    );

    if (!confirmed) return;

    try {
      await apiRequest(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      });

      const nextTemplates = templates.filter(
        (item) => item.category !== category.id
      );
      const nextCategories = categories.filter(
        (item) => item.id !== category.id
      );
      const nextActiveCategory =
        activeCategory === category.id
          ? FALLBACK_CATEGORIES[0]?.id || "birthday"
          : activeCategory;

      setCategories(nextCategories);
      setTemplates(nextTemplates);

      setActiveCategory(nextActiveCategory);

      const nextSelected =
        nextTemplates.find(
          (item) => item.category === nextActiveCategory
        ) || nextTemplates[0] || FALLBACK_TEMPLATES[0];

      setSelectedTemplate(nextSelected);
    } catch (error) {
      setLoadError(error.message || "Unable to delete category");
    }
  }

  function handleTemplateSelect(
    template
  ) {
    if (
      template.isPremium &&
      !isPremiumUser
    ) {
      setShowUpsell(true);
      return;
    }

    setSelectedTemplate(template);
  }

  // admin uploaded template
  function handleAdminCreated(
    template
  ) {
    if (!template) return;

    const newTemplate = {
      id: template._id,
      title: template.title,

      category:
        template.category?._id ||
        template.category,

      categoryLabel:
        template.category?.name,

      image: template.imageUrl,

      isPremium:
        template.isPremium || false,
    };

    setTemplates((prev) => {
      return [
        newTemplate,
        ...prev,
      ];
    });

    // show uploaded template instantly
    if (
      newTemplate.category ===
      activeCategory
    ) {
      setSelectedTemplate(
        newTemplate
      );
    }
  }

  async function handleShare() {
    if (!selectedTemplate?.id)
      return;

    setIsSharing(true);

    setShareMessage(
      "Preparing image..."
    );

    try {
      const data =
        await apiRequest(
          "/api/share/render",
          {
            method: "POST",

            body: JSON.stringify({
              templateId:
                selectedTemplate.id,

              name: activeUser.name,

              photoUrl:
                activeUser.photo,
            }),
          }
        );

      setShareUrl(data.imageUrl);

      setShareMessage(
        "Image ready for sharing"
      );

      if (navigator.share) {
        try {
          await navigator.share({
            title: "Greeting Card",

            text: "Check my greeting card",

            url: data.imageUrl,
          });
          return;
        } catch {
          // fall back below
        }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(
          data.imageUrl
        );
      }

      window.open(
        data.imageUrl,
        "_blank",
        "noopener,noreferrer"
      );

      setShareMessage(
        "Share link copied and opened in a new tab"
      );
    } catch (error) {
      setShareMessage(
        "Sharing failed"
      );
    } finally {
      setIsSharing(false);
    }
  }

 return (
  <div className="min-h-screen bg-green-50 px-5 py-8">
    <div className="max-w-7xl mx-auto">

      {/* navbar */}
      <NavbarSection
        activeUser={activeUser}
        onLogout={onLogout}
        setShowProfileEdit={setShowProfileEdit}
        setShowAdminUpload={setShowAdminUpload}
      />

      {/* error */}
      {loadError && (
        <div className="bg-red-100 text-red-600 px-4 py-3 rounded-xl mt-5">
          {loadError}
        </div>
      )}

      <div className="grid lg:grid-cols-[2fr_420px] gap-6 mt-6 items-start">
        {/* left side */}

        <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-md">
          {/* categories */}

          <div>
            <p className="text-sm font-semibold text-green-700">
              Categories
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              {categories.map((item) => (
                <div
                  key={item.id}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition ${
                    activeCategory === item.id
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-green-50 text-gray-700 border-transparent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleCategoryChange(item.id)
                    }
                    className="leading-none"
                  >
                    {item.title}
                  </button>

                  {item.slug &&
                    !["birthday", "anniversary", "festivals", "gratitude", "friendship", "wedding", "motivation", "farewell"].includes(item.slug) && (
                      <button
                        type="button"
                        aria-label={`Delete ${item.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(item);
                        }}
                        className="h-5 w-5 rounded-full bg-white/90 text-green-700 flex items-center justify-center text-xs font-bold hover:bg-white"
                      >
                        ×
                      </button>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* templates */}

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-7 max-h-[900px] overflow-y-auto pr-2 custom-scroll">

            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() =>
                  handleTemplateSelect(template)
                }
                className={`rounded-2xl overflow-hidden border cursor-pointer transition bg-white ${
                  selectedTemplate.id ===
                  template.id
                    ? "border-green-500"
                    : "border-gray-200"
                }`}
              >
                <div className="relative">
                  <img
                    src={template.image}
                    alt={template.title}
                    className="w-full h-52 object-cover"
                  />

                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-semibold drop-shadow">
                      {activeUser.name}
                    </p>
                  </div>

                  <img
                    src={activeUser.photo}
                    alt={activeUser.name}
                    className="absolute bottom-3 right-3 h-12 w-12 rounded-full border-2 border-white object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">
                    {template.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {template.categoryLabel}
                  </p>

                  <div className="mt-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        template.isPremium
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {template.isPremium ? "Premium" : "Free"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* right side */}

        <div className="sticky top-5 self-start">
          <PreviewSection
            selectedTemplate={selectedTemplate}
            activeUser={activeUser}
            handleShare={handleShare}
            isSharing={isSharing}
            shareMessage={shareMessage}
            shareUrl={shareUrl}
          />
        </div>
      </div>
    </div>

    {showUpsell &&
      plans.length > 0 && (
        <SubscriptionModal
          plans={plans}
          onClose={() =>
            setShowUpsell(false)
          }
        />
      )}

    {showAdminUpload && (
      <AdminUploadModal
        onClose={() =>
          setShowAdminUpload(false)
        }
        onCreated={
          handleAdminCreated
        }
      />
    )}

    {showProfileEdit && (
      <ProfileEditModal
        user={user}
        onClose={() =>
          setShowProfileEdit(false)
        }
        onSaved={
          onProfileUpdated
        }
      />
    )}
  </div>
);
}