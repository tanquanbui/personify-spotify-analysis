import React from "react";

const ArtistInfo = ({ artist }) => {
    const { name, images, genres, popularity } = artist;
    return (
        <div className="artist-info">
            <div className="artist-info__details">
                <h3>{name}</h3>
                <p>Popularity: {popularity}</p>
        </div>
        </div>
    )
};

export default ArtistInfo;
