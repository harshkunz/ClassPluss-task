import { useEffect, useState } from "react";
import { API_BASE_URL, apiRequest, setAuthToken } from "../services/api";

const tabs = [
  { key: "google", text: "Google" },
  { key: "email", text: "Email" },
  { key: "guest", text: "Guest" },
];

function GoogleLogo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12
        s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4C12.9 4 4 12.9 4 24
        s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7
        C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.5-5.3l-6.2-5.2C29.2 35.1 26.7 36 24 36
        c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.2 7.1l6.2 5.2
        C39.9 36.1 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

function TabButtons({ current, setCurrent }) {
  return (
    <div className="flex gap-2 bg-green-50 p-2 rounded-xl">
      {tabs.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => setCurrent(item.key)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
            current === item.key ? "bg-white shadow text-green-700" : "text-gray-500"
          }`}
        >
          {item.text}
        </button>
      ))}
    </div>
  );
}

function EmailSection({
  mode,
  setMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  loading,
}) {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="space-y-4">
      {mode === "signup" && (
        <div>
          <label className="text-sm block mb-1 text-gray-700">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-black border rounded-lg px-4 py-3 outline-none focus:border-green-500"
          />
        </div>
      )}

      <div>
        <label className="text-sm block mb-1 text-gray-700">
          Email
        </label>

        <input
          type="email"
          placeholder="abc@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border text-black rounded-lg px-4 py-3 outline-none focus:border-green-500"
        />
      </div>

      <div>
        <label className="text-sm block mb-1 text-gray-700">
          Password
        </label>

        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border text-black rounded-lg px-4 py-3 outline-none focus:border-green-500"
          />

          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-3 top-3 text-sm text-gray-500"
          >
            {showPass ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
      >
        {loading ? "Please wait..." : mode === "signup" ? "Create Account" : "Login"}
      </button>

      <button
        type="button"
        onClick={() =>
          setMode((prev) => (prev === "login" ? "signup" : "login"))
        }
        className="text-sm text-green-700"
      >
        {mode === "login" ? "Create new account" : "Already have account?"}
      </button>
    </div>
  );
}

function GuestSection({ guest, setGuest, loading }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm block mb-1 text-gray-700">
          Guest Name
        </label>

        <input
          type="text"
          placeholder="Guest user"
          value={guest}
          onChange={(e) => setGuest(e.target.value)}
          className="w-full text-black border rounded-lg px-4 py-3 outline-none focus:border-green-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl"
      >
        {loading ? "Loading..." : "Continue"}
      </button>
    </div>
  );
}

export default function AuthPage({ onAuth }) {
  const [tab, setTab] = useState("google");
  const [name, setName] = useState("");
  const [guest, setGuest] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const oldMail = localStorage.getItem("saved_mail");
    if (oldMail) setEmail(oldMail);
  }, []);

  const previewName = name || guest || "Your Name";

  async function submitHandler(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      if (tab === "google") {
        window.location.href = `${API_BASE_URL}/api/auth/google/start`;
        return;
      }

      if (tab === "email") {
        let url = "/api/auth/email/login";
        if (mode === "signup") url = "/api/auth/email/register";

        const bodyData = mode === "signup"
          ? {
              name,
              email,
              password,
            }
          : {
              email,
              password,
            };

        const result = await apiRequest(url, {
          method: "POST",
          body: JSON.stringify(bodyData),
        });

        setAuthToken(result.token);
        localStorage.setItem("saved_mail", email);
        if (onAuth) onAuth(result.token, result.user);
        return;
      }

      if (tab === "guest") {
        const result = await apiRequest("/api/auth/guest", {
          method: "POST",
          body: JSON.stringify({
            name: guest,
          }),
        });

        setAuthToken(result.token);

        if (onAuth) {
          onAuth(result.token, result.user);
        }
      }
    } catch (error) {
      setErr(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-5 py-10">
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl">

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
          <p className="text-sm text-green-700 font-medium">
            Greeting Preview
          </p>

          <h2 className="text-3xl font-bold mt-2 text-green-900">
            Create personalized wishes
          </h2>

          <p className="text-gray-500 mt-3 text-sm">
            Add your photo and name to generate greeting cards.
          </p>

          <div className="mt-8">
            <div className="bg-green-50 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=800&q=80"
                alt="preview"
                className="w-full h-72 object-cover"
              />

              <div className="p-4">
                <h3 className="font-semibold text-lg text-green-900">
                  {previewName}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Have a wonderful day 🌿
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
          <p className="text-sm text-green-700 font-medium">
            Welcome Back
          </p>

          <h1 className="text-3xl font-bold mt-2 text-green-900">
            Login to your account
          </h1>

          <p className="text-gray-500 mt-3 text-sm">
            Continue with your preferred login method.
          </p>

          <div className="mt-6">
            <TabButtons current={tab} setCurrent={setTab} />
          </div>

          <form className="mt-6" onSubmit={submitHandler}>
            {tab === "google" && (
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white border border-gray-300 hover:bg-gray-50 py-3 rounded-xl flex items-center justify-center gap-3"
                >
                  <GoogleLogo />

                  <span className="font-medium text-gray-700">
                    {loading
                      ? "Connecting..."
                      : "Continue with Google"}
                  </span>
                </button>

                <p className="text-sm text-gray-500 mt-3">
                  Google account will be used for quick login.
                </p>
              </div>
            )}

            {tab === "email" && (
              <EmailSection
                mode={mode}
                setMode={setMode}
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
              />
            )}

            {tab === "guest" && (
              <GuestSection
                guest={guest}
                setGuest={setGuest}
                loading={loading}
              />
            )}
          </form>

          {err && (
            <div className="bg-red-100 text-red-600 text-sm px-4 py-3 rounded-lg mt-5">
              {err}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}