import React from "react";
import "../../Styles/ArtistInfo.css"
const ArtistInfo = ({ artist }) => {
    const { name, images, genres, popularity } = artist;
    return (
        <div className="artist-info">
            <div className="artist-info-details">
                <h3>{name}</h3>
                <p>Popularity: {popularity}</p>
                <img src={images[0].url}></img>
        </div>
        </div>
    )
};

export default ArtistInfo;
