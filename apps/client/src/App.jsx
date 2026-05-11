import { useEffect, useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { apiRequest, getAuthToken, setAuthToken } from "./services/api";

const USER_KEY = "classplus_user";

export default function App() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const url = new URL(window.location.href);
    const oauthToken = url.searchParams.get("token");
    if (oauthToken) {
      setAuthToken(oauthToken);
      setToken(oauthToken);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await apiRequest("/api/auth/me");
        if (isMounted) {
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleAuth = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }
  };

  const handleProfileComplete = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const needsProfile = useMemo(() => {
    if (!user) return false;
    return !user.name || !user.profileImageUrl;
  }, [user]);

  if (isLoading) {
    return null;
  }

  if (!token) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return (
    <>
      <HomePage user={user} />
      {needsProfile && (
        <ProfileSetupModal user={user} onComplete={handleProfileComplete} />
      )}
    </>
  );
}
