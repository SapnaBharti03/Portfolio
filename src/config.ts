// Central API + app configuration. Change API_BASE_URL when wiring real backend.
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || "/api";

// When true, API calls fall back to local mock data (no real backend yet).
export const USE_MOCK_API = true;

export const TOKEN_KEY = "portfolio_admin_token";

export const SITE = {
  brand: "Alex Carter",
  domain: "alexcarter.dev",
};