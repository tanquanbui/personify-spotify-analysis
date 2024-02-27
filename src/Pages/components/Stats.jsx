import axios from "axios";
import React, { useState, useEffect } from "react";
import "../../Styles/Stats.css";
import ArtistInfo from "./ArtistInfo";

const Stats = (props) => {
  const [token, setToken] = useState("");
  const [artist, setArtist] = useState(null);

  const cleaner = (arr) => arr.map((solo) => solo.name).join(", ");

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);
  
  useEffect(() => {
    const getArtist = async () => {
      if (token) {
        const { data } = await axios.get(
          `https://api.spotify.com/v1/artists/${props.apilink}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setArtist(data);
      }
    };

    getArtist();
  }, [props.apilink, token]);

  return (
    <div>
      {artist && (
        <div className="genres">
          {artist.genres.map((genre, index) => (
            <div className="genre" key={index}>
              <p>{genre}</p>
            </div>
          ))}
          <ArtistInfo artist={artist} />
        </div>
      )}
    </div>
  );
};

export default Stats;
