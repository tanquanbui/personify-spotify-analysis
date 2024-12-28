import React, { useState, useEffect } from 'react';

const Login = () => {
    const CLIENT_ID = "7f112c4cfe524c218620897ff68ecfc6";
    const REDIRECT_URI = "http://localhost:3000/callback";
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const RESPONSE_TYPE = "token";
    const SCOPES = "user-top-read playlist-read-private";

    const [token, setToken] = useState(null);
    const [tokenExpiry, setTokenExpiry] = useState(null);

    const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`;

    useEffect(() => {
        // Check if the token is already stored in the URL hash
        const hash = window.location.hash;
        if (hash) {
            const params = new URLSearchParams(hash.substring(1));
            const accessToken = params.get("access_token");
            const expiresIn = params.get("expires_in");

            if (accessToken && expiresIn) {
                const expiryTime = new Date().getTime() + parseInt(expiresIn) * 1000;
                setToken(accessToken);
                setTokenExpiry(expiryTime);

                // Store the token and expiry time in local storage
                localStorage.setItem("spotifyToken", accessToken);
                localStorage.setItem("spotifyTokenExpiry", expiryTime);

                // Clear the hash from the URL
                window.location.hash = "";
            }
        } else {
            // Check for token and expiry time in local storage
            const storedToken = localStorage.getItem("spotifyToken");
            const storedExpiry = localStorage.getItem("spotifyTokenExpiry");

            if (storedToken && storedExpiry && new Date().getTime() < storedExpiry) {
                setToken(storedToken);
                setTokenExpiry(storedExpiry);
            }
        }
    }, []);

    const logout = () => {
        setToken(null);
        setTokenExpiry(null);
        localStorage.removeItem("spotifyToken");
        localStorage.removeItem("spotifyTokenExpiry");
    };

    const isTokenExpired = () => {
        return tokenExpiry && new Date().getTime() > tokenExpiry;
    };

    if (isTokenExpired()) {
        logout();
    }

    return (
        <div>
            <h1>Spotify Login</h1>
            {token ? (
                <div>
                    <p>You are logged in!</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <a href={loginUrl}>Login to Spotify</a>
            )}
        </div>
    );
};

export default Login;
