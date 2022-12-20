import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Cards from "../Cards";
function TopArtists() {
    const [token, setToken] = useState("");
    const [artists, setArtists] = useState([]);
    useEffect(()=> {
    const accessTokenObj = localStorage.getItem("token");
    setToken(accessTokenObj);
    DisplayArtistLong();
    },[])
    
    const DisplayArtistLong = async () => {
        const {data} = await axios.get("https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=30&offset=0", {
            headers: {
                Authorization: `Bearer ${token}`
            },
        })
        setArtists(data.items)
        console.log(artists)
    
    }
    const DisplayArtistMedium = async () => {
        const {data} = await axios.get("https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=30&offset=0", {
            headers: {
                Authorization: `Bearer ${token}`
            },
        })
        setArtists(data.items)
    
    }
    const DisplayArtistShort = async () => {
        const {data} = await axios.get("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=30&offset=0", {
            headers: {
                Authorization: `Bearer ${token}`
            },
        })
        setArtists(data.items)
    
    }
    
    return(
        <div>
        <Cards datas={artists} type="tracks"/>
        </div>
    )
}   

export default TopArtists;