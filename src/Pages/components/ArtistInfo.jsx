import React from "react";
import "../../Styles/ArtistInfo.css";
const ArtistInfo = ({ artist }) => {
  const { name, images, genres, popularity } = artist;
  return (
    <div className="artist-info">
      <img src={images[0].url}></img>
      <div className="artist-info-details">
        <h1>{name}</h1>
        <h2>Popularity: {popularity}</h2>
        <div className="genres">
          {genres.map((genre, index) => (
          <div className= "genre" key={index}>
            <h3>{genre}</h3>
          </div>
        ))}
        </div>
        
        
        <h1></h1>
      </div>
    </div>
  );
};

export default ArtistInfo;
