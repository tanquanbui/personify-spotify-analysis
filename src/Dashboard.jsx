import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WrappedSlides from "./WrappedSlides";
import "./Styles/Wrapped.css";
import {
  exchangeCodeForToken,
  getValidAccessToken,
  refreshAccessToken,
  consumeStoredState,
  clearTokens,
} from "./spotifyAuth";

const TIME_RANGES = ["long_term", "medium_term", "short_term"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [genresByRange, setGenresByRange] = useState({});
  const [dataReady, setDataReady] = useState(false);

  const logout = useCallback(() => {
    clearTokens();
    setToken(null);
    navigate("/");
  }, [navigate]);

  // Handle OAuth callback or restore existing session
  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      if (error) {
        setAuthError(`Spotify authorization failed: ${error}`);
        window.history.replaceState(null, "", "/callback");
        setLoading(false);
        return;
      }

      if (code) {
        const expectedState = consumeStoredState();
        window.history.replaceState(null, "", "/callback");

        if (!state || state !== expectedState) {
          setAuthError("State mismatch — possible CSRF. Please log in again.");
          setLoading(false);
          return;
        }

        try {
          const data = await exchangeCodeForToken(code);
          setToken(data.access_token);
        } catch (err) {
          console.error("Token exchange failed:", err);
          setAuthError("Couldn't complete Spotify login. Please try again.");
        }
        setLoading(false);
        return;
      }

      const validToken = await getValidAccessToken();
      setToken(validToken || null);
      setLoading(false);
    };

    init();
  }, []);

  const authorizedGet = useCallback(
    async (url) => {
      try {
        return await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      } catch (err) {
        if (err.response?.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            setToken(newToken);
            return axios.get(url, { headers: { Authorization: `Bearer ${newToken}` } });
          }
          logout();
        }
        throw err;
      }
    },
    [token, logout]
  );

  const [topTracks, setTopTracks] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Fetch all data once we have a token
  useEffect(() => {
    if (!token) return;

    const fetchAll = async () => {
      try {
        const [artistRes, trackRes, recentTrackRes, profileRes, ...genreRaws] = await Promise.all([
          authorizedGet("https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=5"),
          authorizedGet("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=5"),
          authorizedGet("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50"),
          authorizedGet("https://api.spotify.com/v1/me"),
          ...TIME_RANGES.map((range) =>
            authorizedGet(`https://api.spotify.com/v1/me/top/artists?time_range=${range}`)
          ),
        ]);

        setTopArtists(artistRes.data.items || []);
        setTopTracks(trackRes.data.items || []);
        setRecentTracks(recentTrackRes.data.items || []);
        setUserProfile(profileRes.data || null);

        const genreResults = TIME_RANGES.map((range, i) => {
          const artists = genreRaws[i].data.items || [];
          const counts = {};
          artists.forEach((a) =>
            (a.genres || []).forEach((g) => { counts[g] = (counts[g] || 0) + 1; })
          );
          return [
            range,
            Object.entries(counts)
              .sort((a, b) => b[1] - a[1])
              .map(([genre, count]) => ({ genre, count })),
          ];
        });

        setGenresByRange(Object.fromEntries(genreResults));
        setDataReady(true);
      } catch (err) {
        console.error("Data fetch failed:", err);
        setDataReady(true);
      }
    };

    fetchAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Render ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="ws-loading">
        <div className="ws-loading-dots">
          <div className="ws-loading-dot" />
          <div className="ws-loading-dot" />
          <div className="ws-loading-dot" />
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="ws-loading">
        <p style={{ color: "#a7a7a7", textAlign: "center", maxWidth: 320 }}>{authError}</p>
        <button
          style={{
            marginTop: "1.5rem", background: "#1DB954", color: "#000", border: "none",
            borderRadius: "500px", padding: "12px 32px", fontWeight: 700,
            fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          Back to Login
        </button>
      </div>
    );
  }

  if (!token) {
    navigate("/");
    return null;
  }

  if (!dataReady) {
    return (
      <div className="ws-loading">
        <div className="ws-loading-dots">
          <div className="ws-loading-dot" />
          <div className="ws-loading-dot" />
          <div className="ws-loading-dot" />
        </div>
        <p style={{ color: "#535353", fontSize: "0.85rem", marginTop: "1rem" }}>
          Loading your music…
        </p>
      </div>
    );
  }

  return (
    <WrappedSlides
      topArtists={topArtists}
      topTracks={topTracks}
      recentTracks={recentTracks}
      genresByRange={genresByRange}
      userProfile={userProfile}
      onLogout={logout}
    />
  );
};

export default Dashboard;
