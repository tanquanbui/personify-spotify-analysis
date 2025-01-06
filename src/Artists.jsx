import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Styles/Artists.css";

const Artists = ({ topArtists, token, setTimeRange }) => {
  const [artistTracks, setArtistTracks] = useState({});
  const [visibleArtists, setVisibleArtists] = useState({});

  const fetchArtistTopTracks = async (artistId) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      return data.tracks || [];
    } catch (error) {
      console.error(`Error fetching top tracks for artist ${artistId}:`, error);
      return [];
    }
  };

  const handleArtistClick = async (artistId) => {
    setVisibleArtists((prev) => ({
      ...prev,
      [artistId]: !prev[artistId], // Toggle visibility for the artist
    }));

    // Fetch tracks if not already fetched
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
      <h2>Your Top Artists</h2>
      <div className="tabs">
        <button onClick={() => setTimeRange("long_term")}>Long Term</button>
        <button onClick={() => setTimeRange("medium_term")}>Medium Term</button>
        <button onClick={() => setTimeRange("short_term")}>Short Term</button>
      </div>
      <div className="artists">
        {topArtists.map((artist) => (
          <div
            className="artist"
            key={artist.id}
            onClick={() => handleArtistClick(artist.id)}
            style={{ cursor: "pointer" }}
          >
            <img src={artist.images[0]?.url} alt={artist.name} />
            <h3>{artist.name}</h3>
            <AnimatePresence>
              {visibleArtists[artist.id] && artistTracks[artist.id] && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    overflow: "hidden",
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                  }}
                >
                  {artistTracks[artist.id].map((track) => (
                    <li key={track.id}>
                      {track.name} - {track.album.name}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Artists;
