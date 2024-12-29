import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./Styles/Genres.css"

const Dashboard = () => {
    const [token, setToken] = useState(null);
    const [topArtists, setTopArtists] = useState([]);
    const [genres, setGenres] = useState([]);

    useEffect(() => {
        // Get token from URL hash or localStorage
        const hash = window.location.hash;
        let localToken = localStorage.getItem('token');

        if (!localToken && hash) {
            const params = new URLSearchParams(hash.substring(1));
            localToken = params.get('access_token');
            localStorage.setItem('token', localToken);
            window.location.hash = '';
        }

        setToken(localToken);
    }, []);

    useEffect(() => {
        if (token) {
            fetchTopArtists();
        }
    }, [token]);

    const fetchTopArtists = async () => {
        try {
            const response = await axios.get(
                'https://api.spotify.com/v1/me/top/artists?time_range=long_term',
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const artists = response.data.items || [];
            setTopArtists(artists);
            calculateGenres(artists);
        } catch (error) {
            console.error('Error fetching top artists:', error.response || error.message);
            if (error.response?.status === 401) {
                alert('Token expired. Please log in again.');
                localStorage.removeItem('token');
                setToken(null);
            }
        }
    };

    const calculateGenres = (artists) => {
        const genreCount = {};

        artists.forEach((artist) => {
            if (artist.genres) {
                artist.genres.forEach((genre) => {
                    genreCount[genre] = (genreCount[genre] || 0) + 1;
                });
            }
        });

        const sortedGenres = Object.entries(genreCount)
            .sort((a, b) => b[1] - a[1]) // Sort by frequency
            .map(([genre, count]) => ({ genre, count }));

        setGenres(sortedGenres);
    };

    return (
        <div>
            <h1>Dashboard</h1>

            {/* List of Genres */}
            {genres.length > 0 && (
                <div>
                    <h2>Your Genres</h2>
                    <div className='outsidegenre'>
                        {genres.map(({ genre, count }) => (
                            <div className='genre' key={genre}>
                                {genre}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Top Artists */}
            {topArtists.length > 0 && (
                <div>
                    <h2>Your Top Artists</h2>
                    <ul>
                        {topArtists.map((artist) => (
                            <li key={artist.id}>
                                {artist.name} - Genres: {artist.genres.join(', ')}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {!token && <p>Please log in to view your dashboard.</p>}
        </div>
    );
};

export default Dashboard;
