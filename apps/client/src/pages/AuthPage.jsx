import { useMemo, useState } from "react";

const LOGIN_TABS = [
  { id: "google", label: "Google" },
  { id: "email", label: "Email" },
  { id: "guest", label: "Guest" },
];

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=400&q=80";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("google");
  const [fullName, setFullName] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [guestName, setGuestName] = useState("");

  const avatarUrl = useMemo(() => {
    if (!photoFile) return DEFAULT_AVATAR;
    return URL.createObjectURL(photoFile);
  }, [photoFile]);

  const displayName = fullName || guestName || "Your Name";

  const handlePhotoChange = (event) => {
    const file = event.target.files && event.target.files[0];
    setPhotoFile(file || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // TODO: wire to backend endpoints.
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f3ee] text-[#1c1b1f]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-36 -top-24 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(247,114,78,0.4),transparent_70%)] blur-md" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(28,27,31,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(28,27,31,0.06)_1px,transparent_1px)] bg-[size:70px_70px] opacity-30" />
      </div>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-8 px-6 pb-16 pt-16 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-black/10 bg-white p-9 shadow-[0_20px_50px_rgba(28,27,31,0.1)]">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2c5d63]">
              ClassPlus Studio
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight">
              Sign in to design your moment
            </h1>
            <p className="mt-3 text-base text-[#6f6c73]">
              Create a personalized greeting in seconds with your name and
              profile photo.
            </p>
          </header>

          <div
            className="mt-7 flex gap-3 rounded-2xl bg-[#f0ede7] p-2"
            role="tablist"
            aria-label="Login methods"
          >
            {LOGIN_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-white text-[#1c1b1f] shadow-[0_8px_16px_rgba(28,27,31,0.08)]"
                    : "text-[#6f6c73]"
                }`}
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
            {activeTab === "google" && (
              <div className="grid gap-4">
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-[#f7724e] to-[#ffb071] px-5 py-3 text-base font-semibold text-white shadow-[0_16px_30px_rgba(247,114,78,0.25)]"
                >
                  Continue with Google
                </button>
                <p className="text-sm text-[#6f6c73]">
                  We will request your name and photo for your greeting card.
                </p>
              </div>
            )}

            {activeTab === "email" && (
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-[#6f6c73]">
                  Email
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[#f7724e] focus:ring-4 focus:ring-[#f7724e]/20"
                  />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-[#6f6c73]">
                  Password
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[#f7724e] focus:ring-4 focus:ring-[#f7724e]/20"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-[#f7724e] to-[#ffb071] px-5 py-3 text-base font-semibold text-white shadow-[0_16px_30px_rgba(247,114,78,0.25)]"
                >
                  Sign in with Email
                </button>
              </div>
            )}

            {activeTab === "guest" && (
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-[#6f6c73]">
                  Guest name
                  <input
                    type="text"
                    placeholder="Guest name"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    className="rounded-xl border border-black/10 px-4 py-3 text-base outline-none focus:border-[#f7724e] focus:ring-4 focus:ring-[#f7724e]/20"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-2xl bg-gradient-to-r from-[#f7724e] to-[#ffb071] px-5 py-3 text-base font-semibold text-white shadow-[0_16px_30px_rgba(247,114,78,0.25)]"
                >
                  Continue as Guest
                </button>
              </div>
            )}
          </form>
        </section>

        <section className="rounded-[32px] border border-black/10 bg-white p-9 shadow-[0_20px_50px_rgba(28,27,31,0.1)]">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Profile setup</h2>
            <p className="mt-2 text-sm text-[#6f6c73]">
              Make your greeting personal by adding a name and photo.
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
              <h3 className="mt-1 text-lg font-semibold">{displayName}</h3>
              <p className="text-sm text-[#6f6c73]">
                Your photo appears on the template by default.
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

          <button
            className="mt-5 w-full rounded-2xl bg-[#2c5d63] px-5 py-3 text-base font-semibold text-white"
            type="button"
          >
            Save profile details
          </button>
        </section>
      </main>
    </div>
  );
}
