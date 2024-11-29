import React from 'react';

const Login = () => {
    const CLIENT_ID = "7f112c4cfe524c218620897ff68ecfc6";
const REDIRECT_URI = "http://localhost:3000/callback";
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const RESPONSE_TYPE = "token";

    const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-top-read playlist-read-private`;

    return (
        <div>
            <h1>Spotify Login</h1>
            <a href={loginUrl}>Login to Spotify</a>
        </div>
    );
};

export default Login;
