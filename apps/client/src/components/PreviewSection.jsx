import { useState } from "react";

export default function PreviewSection({
  selectedTemplate,
  activeUser,
  handleShare,
  isSharing,
  shareMessage,
  shareUrl,
}) {
  const [showPreview, setShowPreview] =
    useState(false);

  return (
    <>
      {/* small preview card */}

      <div className="bg-white border border-green-100 rounded-2xl p-5 shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">
          Live Preview
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Click below to open full preview.
        </p>

        <div
          onClick={() => setShowPreview(true)}
          className="mt-5 rounded-2xl overflow-hidden relative h-[450px] cursor-pointer group"
        >
          <img
            src={selectedTemplate.image}
            alt={selectedTemplate.title}
            className="w-full h-full object-cover group-hover:scale-105 transition"
          />

          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <button className="bg-white text-black px-4 py-2 rounded-2xl text-sm font-medium">
              Open Preview
            </button>
          </div>

          <div className="absolute bottom-5 left-5">
            <p className="text-xl font-bold text-white drop-shadow-lg">
              {activeUser.name}
            </p>

            <img
              src={activeUser.photo}
              alt={activeUser.name}
              className="h-14 w-14 rounded-full border-4 border-white mt-3 object-cover"
            />
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-lg text-black font-semibold">
            {selectedTemplate.title}
          </h3>

          <p className="text-sm text-black mt-1">
            {selectedTemplate.categoryLabel}
          </p>
        </div>
      </div>

      {/* popup preview */}

      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl overflow-hidden w-[500px] relative animate-fadeIn">

            {/* close button */}

            <button
              onClick={() => setShowPreview(false)}
              className="absolute text-black top-4 right-4 z-20 bg-white h-10 w-10 rounded-full shadow text-xl"
            >
              X
            </button>

            {/* preview image */}

            <div className="relative h-[680px]">
              <img
                src={selectedTemplate.image}
                alt={selectedTemplate.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-8 left-8">
                <p className="text-4xl font-bold text-white drop-shadow-xl">
                  {activeUser.name}
                </p>

                <img
                  src={activeUser.photo}
                  alt={activeUser.name}
                  className="h-24 w-24 rounded-full border-4 border-white mt-4 object-cover"
                />
              </div>
            </div>

            {/* footer */}

            <div className="p-5 border-t">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h3 className="text-2xl text-black font-bold">
                    {selectedTemplate.title}
                  </h3>

                  <p className="text-gray-500 text-black  mt-1">
                    {selectedTemplate.categoryLabel}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    className="border text-black text-sm px-4 py-2 rounded-2xl"
                  >
                    Customize
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={isSharing}
                    className="bg-green-600 text-white text-sm px-4 py-2 rounded-2xl"
                  >
                    {isSharing
                      ? "Sharing..."
                      : "Share"}
                  </button>
                </div>
              </div>

              <div className="mt-5 bg-green-50 rounded-xl p-4">
                <p className="text-sm text-gray-700">
                  {shareMessage ||
                    "Share link will appear here"}
                </p>

                {shareUrl && (
                  <a
                    href={shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-700 text-sm mt-2 inline-block"
                  >
                    Open Shared Image
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}