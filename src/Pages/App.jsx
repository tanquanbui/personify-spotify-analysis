/**
 * The main component of the Spotify Wrapped Recreate app.
 * @component
 * @return {JSX.Element} The JSX code for the App component.
 */
import React, { useEffect, useState } from 'react';
import User from './components/User';
import Cards from './components/Cards';
import '../Styles/App.css';
import axios from 'axios';
import { getUser,getUsersTopArtists,getUsersTopTracks } from './components/ApiCalls'
function App() {
  // Constants for Spotify API endpoints and client information
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
  const RESPONSE_TYPE = "token";
  const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
  const CLIENT_ID = "7f112c4cfe524c218620897ff68ecfc6";
  const CLIENT_SECRET = "306d676feec54b08a1570abb1d40f513";
  const REDIRECT_URI = "http://localhost:3000/";


  // State variables for authentication and user data
  const [token, setToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [userData, setUserData] = useState('');
  const [topArtists, setTopArtists] = useState('');
  const [topTracks, setTopTracks] = useState('');

  /**
   * Runs on component mount to check for access token in URL hash or local storage.
   * If access token is found, sets the token state variable.
   * If refresh token is found, calls refreshAccessToken function.
   */

  /**
   * Redirects user to Spotify authentication page.
   */
  const handleLogin = () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-top-read`;

    window.location.href = authUrl;
  };

  /**
   * Sends a request to Spotify's token endpoint to refresh the access token.
   * @param {string} refreshToken - The refresh token to use for refreshing the access token.
   */
  const refreshAccessToken = (refreshToken) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', refreshToken);

    // Create a request to Spotify's token endpoint.
    fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
      .then(response => response.json())
      .then(data => {
        const newAccessToken = data.access_token;
        setToken(newAccessToken);
        window.localStorage.setItem('token', newAccessToken);
      })
      .catch(error => {
        console.error('Error refreshing access token:', error);
      });
  };

  /**
   * Sends a GET request to Spotify's "me" endpoint to fetch the user's data.
   * Sets the userData state variable to the fetched data.
   * Logs the fetched data to the console.
   */
  const fetchUserData = async () => {
    try {
      const user = await getUser();
      const topArtists = await getUsersTopArtists();
      const topTracks = await getUsersTopTracks();
      setUserData(user.data);
      setTopArtists(topArtists.data.items);
      setTopTracks(topTracks.data.items);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const newRefreshToken = params.get('refresh_token');

      if (accessToken) {
        setToken(accessToken);
        fetchUserData();
        window.localStorage.setItem('token', accessToken);
      }
      
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
        window.localStorage.setItem('refresh_token', newRefreshToken);
      }
    } else {
      const storedRefreshToken = window.localStorage.getItem('refresh_token');
      if (storedRefreshToken) {
        refreshAccessToken(storedRefreshToken);
      }
    }
  }, [token]);


  /**
   * Renders the App component.
   * If token state variable is truthy, displays a button to fetch user data.
   * If token state variable is falsy, displays a button to log in with Spotify.
   * @return {JSX.Element} The JSX code for the App component.
   */
  return (
    <div className="App">
      {token ? (
        <div>
          <User info={userData}></User>
          <div className="main">
            <div className="section">
              <h1>Top Artists</h1>
              <Cards datas={topTracks} type={"tracks"}></Cards>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <button className="login" onClick={handleLogin}>
            Log in with Spotinpfy
          </button> 
        </div>
      )}
    </div>
  );
}

export default App;
