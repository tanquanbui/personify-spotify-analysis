import axios from "axios";
import React, { useState, useEffect } from "react";
import "../../Styles/Stats.css";
import ArtistInfo from "./ArtistInfo";
import Albums from "./Albums";
import TopTracks from "./TopTracks";
import RelatedArtists from "./RelatedArtists";

const Stats = (props) => {
  const [token, setToken] = useState("");
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [relatedArtists, setRelatedArtists] = useState([]);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);
  
  useEffect(() => {
    const getArtistData = async () => {
      if (token) {
        const artistResponse = await axios.get(
          `https://api.spotify.com/v1/artists/${props.apilink}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setArtist(artistResponse.data);

        const albumsResponse = await axios.get(
          `https://api.spotify.com/v1/artists/${props.apilink}/albums`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAlbums(albumsResponse.data.items);

        const topTracksResponse = await axios.get(
          `https://api.spotify.com/v1/artists/${props.apilink}/top-tracks?market=US`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTopTracks(topTracksResponse.data.tracks);

        const relatedArtistsResponse = await axios.get(
          `https://api.spotify.com/v1/artists/${props.apilink}/related-artists`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRelatedArtists(relatedArtistsResponse.data.artists);
      }
    };

    getArtistData();
  }, [props.apilink, token]);

  return (
    <div className="stats">
      {artist && (
        <div className="genres">
          <ArtistInfo artist={artist} />
        </div>
      )}
      {topTracks.length > 0 && (
        <div className="top-tracks">
          <TopTracks tracks={topTracks} />
        </div>
      )}
      {albums.length > 0 && (
        <div className="albums">
          <Albums albums={albums} />
        </div>
      )}
      
      {relatedArtists.length > 0 && (
        <div className="related-artists">
          <RelatedArtists artists={relatedArtists} />
        </div>
      )}
    </div>
  );
};

export default Stats;
