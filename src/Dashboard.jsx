import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Styles/Genres.css";
import intro from "./Styles/intro.svg";

const Dashboard = () => {
  const [token, setToken] = useState(null);
  const [topArtists, setTopArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [gradientPosition, setGradientPosition] = useState(0);
  const [artistTracks, setArtistTracks] = useState({});

  useEffect(() => {
    // Get token from URL hash or localStorage
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
  }, [token]);

  const fetchTopArtists = async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists?time_range=long_term",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const artists = response.data.items || [];
      setTopArtists(artists);
      calculateGenres(artists);
      console.log(artists);
    } catch (error) {
      console.error(
        "Error fetching top artists:",
        error.response || error.message
      );
      if (error.response?.status === 401) {
        alert("Token expired. Please log in again.");
        localStorage.removeItem("token");
        setToken(null);
      }
    }
  };

  const fetchArtistTopTracks = async (artistId) => {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.tracks || [];
    } catch (error) {
      console.error(
        `Error fetching top tracks for artist ${artistId}:`,
        error.response || error.message
      );
      return [];
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
      .sort((a, b) => b[1] - a[1]) // Sort by frequency
      .map(([genre, count]) => ({ genre, count }));

    setGenres(sortedGenres);
  };

  const handleScroll = () => {
    const scrollTop = window.scrollY; // Amount of scrolling in the Y direction
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight; // Total scrollable height
    const scrollFraction = scrollTop / scrollHeight; // Fraction of scroll completed

    // Convert scrollFraction to a gradient position between 0% and 100%
    const position = scrollFraction * 100;
    setGradientPosition(position);
  };

  useEffect(() => {
    // Attach scroll event listener
    window.addEventListener("scroll", handleScroll);

    return () => {
      // Cleanup scroll event listener
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleArtistClick = async (artistId) => {
    if (!artistTracks[artistId]) {
      const tracks = await fetchArtistTopTracks(artistId);
      setArtistTracks((prev) => ({
        ...prev,
        [artistId]: tracks,
      }));
    }
  };

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
        {/* List of Genres */}
        {genres.length > 0 && (
          <div>
            <h2>Your Top Genres</h2>
            <div className="outsidegenre">
              {genres.map(({ genre, count }) => (
                <div className="genre" key={genre}>
                  {genre}
                </div>
              ))}
            </div>
          </div>
        )}
        {topArtists.length > 0 && (
          <div>
            <h2>Your Top Artists</h2>
            <div className="artists">
              {topArtists.map((artist) => (
                <div
                  className="artist"
                  key={artist.id}
                  onClick={() => handleArtistClick(artist.id)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={artist.images[0].url} alt={artist.name} />
                  <h2>{artist.name}</h2>
                  {artistTracks[artist.id] && (
                    <ul>
                      {artistTracks[artist.id].map((track) => (
                        <li key={track.id}>
                          {track.name} - {track.album.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!token && <p>Please log in to view your dashboard.</p>}
    </div>
  );
};

export default Dashboard;
