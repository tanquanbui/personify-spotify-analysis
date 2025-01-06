import React from "react";
import "./Styles/Genres.css";

const Genres = ({ genres, setTimeRange }) => {
  return (
    <div>
      <h2>Your Top Genres</h2>
      <div className="tabs">
        <button onClick={() => setTimeRange("long_term")}>Long Term</button>
        <button onClick={() => setTimeRange("medium_term")}>Medium Term</button>
        <button onClick={() => setTimeRange("short_term")}>Short Term</button>
      </div>
      <div className="outsidegenre">
        {genres.map(({ genre, count }) => (
          <div className="genre" key={genre}>
            {genre}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Genres;
