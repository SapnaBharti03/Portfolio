import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { TOKEN_KEY } from "@/config";

interface AdminUser {
  email: string;
  name: string;
}

interface AuthContextValue {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = "portfolio_admin_user";

// Mock credentials — anything works, but we seed a default
const DEFAULT_EMAIL = "admin@portfolio.dev";
const DEFAULT_PASSWORD = "admin123";

function mockJwt(email: string) {
  return btoa(`${email}:${Date.now()}`);
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    const u = localStorage.getItem(USER_KEY);
    if (t && u) {
      setToken(t);
      try {
        setUser(JSON.parse(u));
      } catch {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await delay(600);
    // accept default creds OR any email/password >= 6 chars (mock)
    const ok =
      (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) ||
      (email.includes("@") && password.length >= 6);
    if (!ok) throw new Error("Invalid email or password");
    const t = mockJwt(email);
    const u: AdminUser = { email, name: email.split("@")[0] };
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const signup = async (name: string, email: string, password: string) => {
    await delay(700);
    if (!email.includes("@") || password.length < 6) {
      throw new Error("Invalid signup details");
    }
    const t = mockJwt(email);
    const u: AdminUser = { email, name };
    localStorage.setItem(TOKEN_KEY, t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const ADMIN_DEFAULT_CREDENTIALS = {
  email: DEFAULT_EMAIL,
  password: DEFAULT_PASSWORD,
};