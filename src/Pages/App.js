import '../Styles/App.css';
import React from 'react';
import {useEffect, useState} from 'react';
import axios from 'axios';
import User from './components/User';
import TopArtists from './components/TopArtists/TopArtists';
import Cards from './components/Cards';
function App() {
  const CLIENT_ID = "7f112c4cfe524c218620897ff68ecfc6"
  const REDIRECT_URI = process.env.NODE_ENV !== 'production'
  ? 'http://localhost:3000/'
  : 'https://spotifyprofilechecker.netlify.app/'
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"
  const [height, setHeight] = useState();
  const [tracks, setTracks] = useState([]);
  const [tracksWeekly, setTracksWeekly] = useState([]);
  const [tracksYearly, setTracksYearly] = useState([]);
  const [token, setToken] = useState("");
  const [user, setUser] = useState([]);
  const [img, setImg] = useState("");
  console.log(token)
  useEffect(() => {
      const hash = window.location.hash
      let token = window.localStorage.getItem("token")
      if (!token && hash) {
          token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

          window.location.hash = ""
          window.localStorage.setItem("token", token)
      }
      console.log(token)
      setToken(token)
      

  }, [])
  useEffect(()=>{
    getUserInfo();
    getUsersTopTracksSinceAnYear();
    getUsersTopTracksSinceWeeks();
  },[token])
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
}
  const getUserInfo = async () => {
    const {data} = await axios.get("https://api.spotify.com/v1/me", {headers})
    setUser(data)
    setImg(data.images[0].url)
}
const getUsersTop5Artists = async () => {
   const {data} = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=9&time_range=long_term', {headers})
}
const getUsersTopArtists = async () => {
   const {data} = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=15', {headers})
}
const getUsersTopArtistsSinceWeeks = async () => {
   const {data} = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=15&time_range=short_term', {headers})
}
const getUsersTopArtistsSinceAnYear = async () => {
   const {data} = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=15&time_range=long_term', {headers})
}
const getUsersTop5Tracks = async () => {
   const {data} = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=9&time_range=long_term&limit=4', {headers})
}
const getUsersTopTracks = async () => {
   const {data} = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=9', {headers})
}
const getUsersTopTracksSinceWeeks = async () => {
   const {data} = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=9&time_range=short_term', {headers})
   setTracksWeekly(data.items)
}
const getUsersTopTracksSinceAnYear = async () => {
   const {data} = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=15&time_range=long_term', {headers})
   setTracksYearly(data.items)
}
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }
  return (
    <div className="App">
       <header className="App-header">
             
              {!token ?
                    <div className='login'>
                      <h1>spotify lol</h1>
                    <a className='login' href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-top-read`}>Login
                      to Spotify</a>
                      </div>
                  : 
                  <div className='main'> 
                  <div className='section'>
                      <User info={user} images={img}></User>
                      {height}
                      <button className='logout' onClick={logout}>Logout</button>
                  </div>
                  <div className='section'>
                  <Cards datas={tracks} type="tracks"/>
                  </div>
                  <div className='section'>
                  <Cards datas={tracksWeekly} type="tracks"/>
                  </div>
                  <div className='section'>
                  <Cards datas={tracksYearly} type="tracks"/>
                  </div>
                  </div>}
                  
          </header>
    </div>
  );
}

export default App;
