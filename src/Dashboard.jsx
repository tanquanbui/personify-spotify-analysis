import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Genres from "./Genres";
import Artists from "./Artists";
import "./Styles/Dashboard.css";
import intro from "./Styles/intro.svg";
import {
  exchangeCodeForToken,
  getValidAccessToken,
  refreshAccessToken,
  consumeStoredState,
  clearTokens,
} from "./spotifyAuth";

const TIME_RANGES = ["long_term", "medium_term", "short_term"];

const RANGE_LABELS = {
  long_term: "All Time",
  medium_term: "Last 6 Months",
  short_term: "Last Month",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [genresByRange, setGenresByRange] = useState({});
  const [artistTimeRange, setArtistTimeRange] = useState("long_term");
  const [genreTimeRange, setGenreTimeRange] = useState("long_term");

  const logout = useCallback(() => {
    clearTokens();
    setToken(null);
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const error = params.get("error");

      if (error) {
        setAuthError(`Spotify authorization failed: ${error}`);
        window.history.replaceState(null, "", "/callback");
        return;
      }

      if (code) {
        const expectedState = consumeStoredState();
        window.history.replaceState(null, "", "/callback");

        if (!state || state !== expectedState) {
          setAuthError("Authorization state mismatch. Please log in again.");
          return;
        }

        try {
          const data = await exchangeCodeForToken(code);
          setToken(data.access_token);
        } catch (err) {
          console.error("Error exchanging code for token:", err);
          setAuthError("Could not complete Spotify login. Please try again.");
        }
        return;
      }

      const validToken = await getValidAccessToken();
      setToken(validToken || null);
    };

    init();
  }, []);

  const authorizedGet = useCallback(
    async (url) => {
      try {
        return await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      } catch (error) {
        if (error.response?.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            setToken(newToken);
            return axios.get(url, { headers: { Authorization: `Bearer ${newToken}` } });
          }
          logout();
        }
        throw error;
      }
    },
    [token, logout]
  );

  const fetchTopArtists = useCallback(async () => {
    try {
      const response = await authorizedGet(
        `https://api.spotify.com/v1/me/top/artists?time_range=${artistTimeRange}`
      );
      setTopArtists(response.data.items || []);
    } catch (error) {
      console.error("Error fetching top artists:", error.response || error.message);
    }
  }, [authorizedGet, artistTimeRange]);

  const fetchGenresForRange = useCallback(
    async (range) => {
      try {
        const response = await authorizedGet(
          `https://api.spotify.com/v1/me/top/artists?time_range=${range}`
        );
        const artists = response.data.items || [];
        const genreCount = {};
        artists.forEach((artist) => {
          (artist.genres || []).forEach((genre) => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        });
        const sortedGenres = Object.entries(genreCount)
          .sort((a, b) => b[1] - a[1])
          .map(([genre, count]) => ({ genre, count }));
        setGenresByRange((prev) => ({ ...prev, [range]: sortedGenres }));
      } catch (error) {
        console.error(`Error fetching genres for ${range}:`, error.response || error.message);
      }
    },
    [authorizedGet]
  );

  useEffect(() => {
    if (token) fetchTopArtists();
  }, [token, fetchTopArtists]);

  useEffect(() => {
    if (token) {
      TIME_RANGES.forEach((range) => fetchGenresForRange(range));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (authError) {
    return (
      <div className="dashboard-error">
        <p>{authError}</p>
        <button className="btn-primary" onClick={() => navigate("/")}>Back to Login</button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="dashboard-empty">
        <p>No session found.</p>
        <button className="btn-primary" onClick={() => navigate("/")}>Log in with Spotify</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <span className="dashboard-nav-title">Personify</span>
        <button className="btn-logout" onClick={logout}>Disconnect</button>
      </nav>

      <div className="dashboard-hero">
        <img className="logo" src={intro} alt="Personify" />
      </div>

      <div className="section-divider" />

      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Top Genres</h2>
          <p className="section-subtitle">Your most-listened genres across different time periods</p>
        </div>
        <Genres
          genresByRange={genresByRange}
          timeRange={genreTimeRange}
          setTimeRange={setGenreTimeRange}
        />
      </div>

      <div className="section-divider" />

      <div className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Top Artists</h2>
          <p className="section-subtitle">Click an artist to see their top tracks</p>
        </div>
        <div className="time-range-pills">
          {TIME_RANGES.map((range) => (
            <button
              key={range}
              className={`time-range-pill${artistTimeRange === range ? " active" : ""}`}
              onClick={() => setArtistTimeRange(range)}
            >
              {RANGE_LABELS[range]}
            </button>
          ))}
        </div>
        <Artists topArtists={topArtists} token={token} />
      </div>
    </div>
  );
};

export default Dashboard;
