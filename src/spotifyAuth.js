import axios from "axios";

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:4000";

const ACCESS_TOKEN_KEY = "spotify_access_token";
const REFRESH_TOKEN_KEY = "spotify_refresh_token";
const EXPIRY_KEY = "spotify_token_expiry";
const STATE_KEY = "spotify_auth_state";

// Refresh slightly before actual expiry to avoid races with in-flight requests.
const EXPIRY_BUFFER_MS = 60 * 1000;

export function generateAndStoreState() {
  const bytes = new Uint8Array(16);
  window.crypto.getRandomValues(bytes);
  const state = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  sessionStorage.setItem(STATE_KEY, state);
  return state;
}

export function consumeStoredState() {
  const state = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return state;
}

export function getStoredTokens() {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);
  return {
    accessToken,
    refreshToken,
    expiry: expiry ? parseInt(expiry, 10) : null,
  };
}

function storeTokens({ access_token, refresh_token, expires_in }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access_token);
  if (refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
  }
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + expires_in * 1000));
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(EXPIRY_KEY);
}

export function isTokenExpired(expiry) {
  return !expiry || Date.now() > expiry - EXPIRY_BUFFER_MS;
}

export async function exchangeCodeForToken(code) {
  const response = await axios.post(`${SERVER_URL}/api/exchange`, { code });
  storeTokens(response.data);
  return response.data;
}

export async function refreshAccessToken() {
  const { refreshToken } = getStoredTokens();
  if (!refreshToken) {
    clearTokens();
    return null;
  }

  try {
    const response = await axios.post(`${SERVER_URL}/api/refresh`, {
      refresh_token: refreshToken,
    });
    storeTokens(response.data);
    return response.data.access_token;
  } catch (error) {
    clearTokens();
    return null;
  }
}

// Returns a usable access token, transparently refreshing it if it has expired.
export async function getValidAccessToken() {
  const { accessToken, expiry } = getStoredTokens();
  if (accessToken && !isTokenExpired(expiry)) {
    return accessToken;
  }
  return refreshAccessToken();
}
