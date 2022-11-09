import React from "react";
import {useEffect, useState} from "react"
import axios from "axios";


function Login() {
  const CLIENT_ID = "7f112c4cfe524c218620897ff68ecfc6"
  const REDIRECT_URI = "http://localhost:3000"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([])
  console.log(artists)
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
//   const renderArtists = () => {
//     return artists.map(artist => (
//         <div key={artist.id}>
//             {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt=""/> : <div>No Image</div>}
//             {artist.name}
//         </div>
//     ))
// }
  const logout = () => {
      setToken("")
      window.localStorage.removeItem("token")
  }
  const searchArtists = async (e) => {
    e.preventDefault()
    const {data} = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
            Authorization: `Bearer ${token}`
        },
    })
    setArtists({data})
    console.log(artists)
}

  return (
      <div className="App">
          <header className="App-header">
              <h1>Spotify React</h1>
              {!token ?
                  <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state`}>Login
                      to Spotify</a>
                  : <button onClick={logout}>Logout</button>}
                  <form onSubmit={searchArtists}>
    <input type="text" onChange={e => setSearchKey(e.target.value)}/>
    <button type={"submit"}>Search</button>
</form>
          </header>
          
      </div>
  );
}

export default Login;