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

const Dashboard = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [genresByRange, setGenresByRange] = useState({});
  const [artistTimeRange, setArtistTimeRange] = useState("long_term");
  const [genreTimeRange, setGenreTimeRange] = useState("long_term");
  const [gradientPosition, setGradientPosition] = useState(0);

  const logout = useCallback(() => {
    clearTokens();
    setToken(null);
    navigate("/");
  }, [navigate]);

  // Handle the redirect back from Spotify (?code=...&state=...), then fall
  // back to whatever session is already in storage.
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

  // Wraps a Spotify API GET call, retrying once with a refreshed token on 401.
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
        console.error(`Error fetching top genres for ${range}:`, error.response || error.message);
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

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      setGradientPosition(scrollFraction * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (authError) {
    return (
      <div>
        <p>{authError}</p>
        <button onClick={() => navigate("/")}>Back to login</button>
      </div>
    );
  }

  return (
    <div>
      {!token && <p>Please log in to view your dashboard.</p>}
      <div
        className="scroll-gradient"
        style={{
          background: `linear-gradient(270deg, #ff7e5f, #feb47b, #86a8e7, #91eae4)`,
          backgroundSize: "400% 400%",
          backgroundPosition: `${gradientPosition}% 50%`,
          transition: "background-position 0.1s ease-out",
        }}
      >
        <div className="intro">
          <img className="logo" src={intro} alt="" />
        </div>
        <Genres
          genresByRange={genresByRange}
          timeRange={genreTimeRange}
          setTimeRange={setGenreTimeRange}
        />
        <Artists topArtists={topArtists} token={token} setTimeRange={setArtistTimeRange} />
      </div>
    </div>
  );
};

export default Dashboard;
