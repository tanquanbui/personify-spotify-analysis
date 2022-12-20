import '../Styles/App.css';
import React from 'react';
import {useEffect, useState} from 'react';
import axios from 'axios';
import Layout from './Layout';
import User from './components/User';
function App() {
  const CLIENT_ID = "7f112c4cfe524c218620897ff68ecfc6"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

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
  },[token])
  const getUserInfo = async () => {
    const {data} = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${token}`
        },
    })
    setUser(data)
    console.log(data.images[0].url);
    setImg(data.images[0].url)


}
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }
  return (
    <div className="App">
       <header className="App-header">
             
              {!token ?
                    <div>
                      <h1>spotify lol</h1>
                    <a className='login' href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-top-read`}>Login
                      to Spotify</a>
                      </div>
                  : <div className='main'> 
                  <User info={user} images={img}></User>
                  <Layout></Layout>
                  <button className='logout' onClick={logout}>Logout</button>
                  </div>}
                  
          </header>
    </div>
  );
}

export default App;
