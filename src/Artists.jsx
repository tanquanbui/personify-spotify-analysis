import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Styles/Artists.css";

const Artists = ({ topArtists, token }) => {
  const [artistTracks, setArtistTracks] = useState({});
  const [expanded, setExpanded] = useState({});

  const fetchTopTracks = async (artistId) => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      return data.tracks || [];
    } catch (error) {
      console.error(`Error fetching tracks for ${artistId}:`, error);
      return [];
    }
  };

  const handleArtistClick = async (artistId) => {
    setExpanded((prev) => ({ ...prev, [artistId]: !prev[artistId] }));
    if (!artistTracks[artistId]) {
      const tracks = await fetchTopTracks(artistId);
      setArtistTracks((prev) => ({ ...prev, [artistId]: tracks }));
    }
  };

  if (!topArtists.length) {
    return <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading artists…</p>;
  }

  return (
    <div className="artists-grid">
      {topArtists.map((artist) => (
        <div
          className="artist-card"
          key={artist.id}
          onClick={() => handleArtistClick(artist.id)}
        >
          <img src={artist.images[0]?.url} alt={artist.name} />
          <p className="artist-name">{artist.name}</p>
          <p className="artist-expand-hint">
            {expanded[artist.id] ? "▲ collapse" : "▼ top tracks"}
          </p>
          <AnimatePresence>
            {expanded[artist.id] && artistTracks[artist.id] && (
              <motion.ul
                className="artist-tracks"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {artistTracks[artist.id].slice(0, 5).map((track) => (
                  <li key={track.id}>
                    <span className="artist-track-name">{track.name}</span>
                    <span className="artist-track-album">{track.album.name}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default Artists;
