import axios from "axios";
import React, { useState, useEffect } from "react";
import "../../Styles/Stats.css";

const Stats = (props) => {
  const [token, setToken] = useState("");
  const [artist, setArtist] = useState(null);

  const cleaner = (arr) => {
    const array = arr.map((solo) => solo.name);
    return array.join(", ");
  };

  useEffect(() => {
    const accessTokenObj = localStorage.getItem("token");
    setToken(accessTokenObj);
  }, []);

  useEffect(() => {
    const getArtist = async () => {
      const { data } = await axios.get(
        `https://api.spotify.com/v1/artists/${props.apilink}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setArtist(data);
    };

    if (token) {
      getArtist();
    }
  }, [props.apilink, token]);
  console.log(artist);

  return (
    <div >
      {artist && (
        <div className="genres">
          {artist.genres.map((genre, index) => (
            <div className="genre">
                <p key={index}>{genre}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Stats;
