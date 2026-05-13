
export default function TemplatesSection({
  categories,
  activeCategory,
  handleCategoryChange,
  handleDeleteCategory,
  filteredTemplates,
  selectedTemplate,
  handleTemplateSelect,
  activeUser,
}) {
  const defaultSlugs = [
    "birthday",
    "anniversary",
    "festivals",
    "gratitude",
    "friendship",
    "wedding",
    "motivation",
    "farewell",
  ];

  return (
    <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-md">
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
                onClick={() => handleCategoryChange(item.id)}
              >
                {item.title}
              </button>

              {item.slug &&
                !defaultSlugs.includes(item.slug) &&
                handleDeleteCategory && (
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

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 mt-7">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className={`rounded-2xl overflow-hidden border cursor-pointer transition ${
              selectedTemplate.id === template.id
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
                <p className="font-semibold">
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
  );
}