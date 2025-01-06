import React, { useEffect, useState } from "react";
import axios from "axios";
import Genres from "./Genres";
import Artists from "./Artists";
import "./Styles/Dashboard.css";
import intro from "./Styles/intro.svg";

const Dashboard = () => {
  const [token, setToken] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [timeRange, setTimeRange] = useState("long_term");
  const [gradientPosition, setGradientPosition] = useState(0);

  useEffect(() => {
    const hash = window.location.hash;
    let localToken = localStorage.getItem("token");

    if (!localToken && hash) {
      const params = new URLSearchParams(hash.substring(1));
      localToken = params.get("access_token");
      localStorage.setItem("token", localToken);
      window.location.hash = "";
    }

    setToken(localToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchTopArtists();
    }
  }, [token, timeRange]);

  const fetchTopArtists = async () => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const artists = response.data.items || [];
      setTopArtists(artists);
      calculateGenres(artists);
    } catch (error) {
      console.error("Error fetching top artists:", error.response || error.message);
      if (error.response?.status === 401) {
        alert("Token expired. Please log in again.");
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  };

  const calculateGenres = (artists) => {
    const genreCount = {};
    artists.forEach((artist) => {
      if (artist.genres) {
        artist.genres.forEach((genre) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    const sortedGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .map(([genre, count]) => ({ genre, count }));

    setGenres(sortedGenres);
  };

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollTop / scrollHeight;

    setGradientPosition(scrollFraction * 100);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div
        className="scroll-gradient"
        style={{
          background: `linear-gradient(270deg, #ff7e5f, #feb47b, #86a8e7, #91eae4)`,
          backgroundSize: "400% 400%",
          backgroundPosition: `${gradientPosition}% 50%`,
          transition: "background-position 0.1s ease-out",
        }}
      >
        <img src={intro} alt="" />
        <Genres genres={genres} setTimeRange={setTimeRange} />
        <Artists topArtists={topArtists} token={token} setTimeRange={setTimeRange} />
      </div>
      {!token && <p>Please log in to view your dashboard.</p>}
    </div>
  );
};

export default Dashboard;
