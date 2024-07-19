import React from "react";
import "../../Styles/TopTracks.css";

const TopTracks = ({ tracks }) => {
  return (
    <div>
      <h2>Top Tracks</h2>
      <div className="tracks-container">
        <div className="tracks">
          {tracks.map((track) => (
            <div className="track" key={track.id}>
              <img src={track.album.images[0]?.url} alt={track.name} />
              <p>{track.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopTracks;
