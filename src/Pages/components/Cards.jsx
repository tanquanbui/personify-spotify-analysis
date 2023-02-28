import React from "react";
import { motion } from "framer-motion";
import '../../Styles/Cards.css'
import { useState } from "react";
import Card from "./Card";
function Cards(props) {
    const [isOpen, setIsOpen] = useState(false)
    const datas = props.datas;
    console.log(datas)
   
    if(props.type === "tracks"){
        return(
            <div className="outside">
         {datas.map((art) => (
                <motion.div 
                className="card">

                    <Card image={art.album.images[0].url} name={art.name} id={art.id} artists={art.artists}></Card>
                    
                </motion.div>
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