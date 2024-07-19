import React from "react";
import "../../Styles/RelatedArtist.css";  // Adjust the path as needed

const RelatedArtists = ({ artists }) => {
  return (
    <div>
      <h2>Related Artists</h2>
      <div className="albums-container">
        <div className="albums">
          {artists.map((artist) => (
            <div className="album" key={artist.id}>
              <img src={artist.images[0]?.url} alt={artist.name} />
              <p>{artist.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedArtists;
