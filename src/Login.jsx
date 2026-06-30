import React, { useEffect, useState } from "react";
import "./Styles/Login.css";
import { generateAndStoreState, getStoredTokens, isTokenExpired, clearTokens } from "./spotifyAuth";

const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "YOUR_CLIENT_ID";
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPES = "user-top-read playlist-read-private";

const Login = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const { accessToken, expiry } = getStoredTokens();
    setLoggedIn(Boolean(accessToken) && !isTokenExpired(expiry));
  }, []);

  const handleLogin = () => {
    const state = generateAndStoreState();
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      state,
    });

    window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`;
  };

  const logout = () => {
    clearTokens();
    setLoggedIn(false);
  };

  return (
    <div className="login">
      <h1>Spotify Login</h1>
      {loggedIn ? (
        <div>
          <p>You are logged in!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login to Spotify</button>
      )}
    </div>
  );
};

export default Login;
