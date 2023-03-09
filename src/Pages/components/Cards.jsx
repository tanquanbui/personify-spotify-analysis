import React from "react";
import { motion } from "framer-motion";
import '../../Styles/Cards.css'
import { useState,useEffect } from "react";
import Card from "./Card";
function Cards(props) {
    const [isOpen, setIsOpen] = useState(false)
    const datas = props.datas;
    const [token, setToken] = useState("");
    useEffect(()=> {
        const accessTokenObj = localStorage.getItem("token");
        setToken(accessTokenObj);
        },[])
    console.log(token)
    console.log(datas)
   
    if(props.type === "tracks"){
        return(
            <div className="outside">
         {datas.map((art) => (
                    <Card token={token} image={art.album.images[0].url} name={art.name} id={art.id} artists={art.artists}></Card>

            ))}
            </div>
            )
    }
    
    if(props.type === "artists"){
        return(
            <div></div>
        )

    }
    }
export default Cards;