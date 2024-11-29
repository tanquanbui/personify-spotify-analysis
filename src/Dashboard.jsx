import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [token, setToken] = useState("");
    const [topArtists, setTopArtists] = useState([]);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [topTrack, setTopTrack] = useState(null);
    const [similarArtists, setSimilarArtists] = useState([]);

    useEffect(() => {
        const hash = window.location.hash;
        let token = localStorage.getItem("token");

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
            window.location.hash = "";
            localStorage.setItem("token", token);
        }

        setToken(token);
    }, []);

    useEffect(() => {
        if (token) {
            // Fetch top artists
            axios.get("https://api.spotify.com/v1/me/top/artists", {
                headers: { Authorization: `Bearer ${token}` },
            }).then((res) => setTopArtists(res.data.items));
        }
    }, [token]);

    const handleArtistClick = (artist) => {
        console.log("Fetching data for artist:", artist);
        console.log("Using artist ID:", artist.id);
        console.log("Token:", token);
    
        // Fetch top track for the selected artist
        axios
            .get(`https://api.spotify.com/v1/artists/${artist.id}/top-tracks`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { market: "US" }, // Include market parameter
            })
            .then((res) => {
                if (res.data.tracks && res.data.tracks.length > 0) {
                    console.log("Top track response:", res.data.tracks[0]);
                    setTopTrack(res.data.tracks[0]);
                } else {
                    console.warn("No tracks available for this artist.");
                    alert("No tracks found for this artist in the specified market.");
                }
            })
            .catch((err) => {
                console.error("Error fetching top tracks:", err.response || err.message);
                alert("Failed to fetch top track for this artist. Please try again.");
            });
    
        // Fetch similar artists
        axios
            .get(`https://api.spotify.com/v1/artists/${artist.id}/related-artists`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                if (res.data.artists && res.data.artists.length > 0) {
                    console.log("Related artists response:", res.data.artists);
                    setSimilarArtists(res.data.artists);
                } else {
                    console.warn("No similar artists found.");
                    alert("No similar artists found for this artist.");
                }
            })
            .catch((err) => {
                console.error("Error fetching similar artists:", err.response || err.message);
                alert("Failed to fetch similar artists. Please try again.");
            });
    };
    
    

    return (
        <div style={styles.container}>
            {!token ? (
                <a href="/" style={styles.loginLink}>
                    Login to Spotify
                </a>
            ) : (
                <>
                    <h1 style={styles.header}>Your Top Artists</h1>
                    <div style={styles.artistList}>
                        {topArtists.map((artist) => (
                            <div
                                key={artist.id}
                                style={styles.artistCard}
                                onClick={() => handleArtistClick(artist)}
                            >
                                <img
                                    src={artist.images[0]?.url}
                                    alt={artist.name}
                                    style={styles.artistImage}
                                />
                                <p style={styles.artistName}>{artist.name}</p>
                            </div>
                        ))}
                    </div>

                    {selectedArtist && (
                        <div style={styles.artistDetails}>
                            <div style={styles.artistProfile}>
                                <img
                                    src={selectedArtist.images[0]?.url}
                                    alt={selectedArtist.name}
                                    style={styles.largeArtistImage}
                                />
                                <h2 style={styles.artistTitle}>{selectedArtist.name}</h2>
                            </div>

                            <div style={styles.topTrack}>
                                <h3 style={styles.sectionHeader}>Your Top Song</h3>
                                {topTrack && (
                                    <div>
                                        <img
                                            src={topTrack.album.images[0]?.url}
                                            alt={topTrack.name}
                                            style={styles.trackImage}
                                        />
                                        <p style={styles.trackName}>{topTrack.name}</p>
                                        <p style={styles.trackAlbum}>
                                            {topTrack.album.name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div style={styles.similarArtists}>
                                <h3 style={styles.sectionHeader}>Similar Artists</h3>
                                <div style={styles.similarArtistsList}>
                                    {similarArtists.map((artist) => (
                                        <div key={artist.id} style={styles.similarArtistCard}>
                                            <img
                                                src={artist.images[0]?.url}
                                                alt={artist.name}
                                                style={styles.similarArtistImage}
                                            />
                                            <p style={styles.similarArtistName}>{artist.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#121212",
        color: "#ffffff",
        minHeight: "100vh",
        padding: "20px",
    },
    header: {
        fontSize: "2.5rem",
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: "20px",
        color: "#1DB954",
    },
    artistList: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px",
    },
    artistCard: {
        backgroundColor: "#282828",
        borderRadius: "15px",
        padding: "15px",
        width: "150px",
        textAlign: "center",
        cursor: "pointer",
        transition: "transform 0.3s",
    },
    artistCardHover: {
        transform: "scale(1.05)",
    },
    artistImage: {
        width: "100%",
        borderRadius: "50%",
        marginBottom: "10px",
    },
    artistName: {
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#1DB954",
    },
    artistDetails: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "40px",
    },
    artistProfile: {
        textAlign: "center",
    },
    largeArtistImage: {
        width: "200px",
        height: "200px",
        borderRadius: "50%",
        marginBottom: "10px",
    },
    artistTitle: {
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: "#ffffff",
    },
    topTrack: {
        textAlign: "center",
    },
    sectionHeader: {
        fontSize: "1.2rem",
        marginBottom: "10px",
        color: "#1DB954",
    },
    trackImage: {
        width: "150px",
        borderRadius: "8px",
        marginBottom: "10px",
    },
    trackName: {
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#ffffff",
    },
    trackAlbum: {
        fontSize: "0.9rem",
        color: "#b3b3b3",
    },
    similarArtists: {
        textAlign: "center",
    },
    similarArtistsList: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px",
    },
    similarArtistCard: {
        textAlign: "center",
    },
    similarArtistImage: {
        width: "100px",
        height: "100px",
        borderRadius: "50%",
    },
    similarArtistName: {
        fontSize: "0.9rem",
        fontWeight: "bold",
        color: "#1DB954",
        marginTop: "10px",
    },
};

export default Dashboard;
