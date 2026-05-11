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
    <div className="auth-shell">
      <div className="auth-bg">
        <div className="auth-glow" />
        <div className="auth-grid" />
      </div>

      <main className="auth-layout">
        <section className="auth-card">
          <header className="auth-header">
            <p className="auth-kicker">ClassPlus Studio</p>
            <h1>Sign in to design your moment</h1>
            <p className="auth-subtitle">
              Create a personalized greeting in seconds with your name and
              profile photo.
            </p>
          </header>

          <div className="auth-tabs" role="tablist" aria-label="Login methods">
            {LOGIN_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                className={`auth-tab ${activeTab === tab.id ? "is-active" : ""}`}
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {activeTab === "google" && (
              <div className="auth-panel">
                <button type="submit" className="auth-cta">
                  Continue with Google
                </button>
                <p className="auth-hint">
                  We will request your name and photo for your greeting card.
                </p>
              </div>
            )}

            {activeTab === "email" && (
              <div className="auth-panel">
                <label className="auth-field">
                  Email
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </label>
                <label className="auth-field">
                  Password
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </label>
                <button type="submit" className="auth-cta">
                  Sign in with Email
                </button>
              </div>
            )}

            {activeTab === "guest" && (
              <div className="auth-panel">
                <label className="auth-field">
                  Guest name
                  <input
                    type="text"
                    placeholder="Guest name"
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                  />
                </label>
                <button type="submit" className="auth-cta">
                  Continue as Guest
                </button>
              </div>
            )}
          </form>
        </section>

        <section className="profile-card">
          <div className="profile-header">
            <h2>Profile setup</h2>
            <p>Make your greeting personal by adding a name and photo.</p>
          </div>

          <div className="profile-preview">
            <div className="avatar-ring">
              <img src={avatarUrl} alt="Profile preview" />
            </div>
            <div className="preview-text">
              <span className="preview-label">Preview</span>
              <h3>{displayName}</h3>
              <p>Your photo appears on the template by default.</p>
            </div>
          </div>

          <div className="profile-fields">
            <label className="auth-field">
              Full name
              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </label>
            <label className="auth-field">
              Profile photo
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>

          <button className="profile-save" type="button">
            Save profile details
          </button>
        </section>
      </main>
    </div>
  );
}
