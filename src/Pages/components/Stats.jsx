import axios from "axios";
import { useState, useEffect } from "react";
const Stats =(props)=>{
    const [token, setToken] = useState("");
    const [artists, setArtists] = useState([]);
    useEffect(()=> {
    const accessTokenObj = localStorage.getItem("token");
    setToken(accessTokenObj);
    },[])
    const songid = props.songid;
    const DisplayArtistLong = async () => {
            const {data} = await axios.get(`https://api.spotify.com/v1/audio-features/${songid}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
            })
            console.log(data)
            setArtists(data)
        
        }

    useEffect(()=>{
        DisplayArtistLong()
    },[token])
    return(
        <div>{artists.energy}
        </div>
    )
}
export default Stats;