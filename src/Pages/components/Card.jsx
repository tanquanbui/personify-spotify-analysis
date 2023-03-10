import '../../Styles/Cards.css'
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from "react";
import Stats from './Stats';
const Card =(props)=>{
    const [isOpen, setIsOpen] = useState(false);
    const image = props.image;
    const name = props.name
    const artists = props.artists;
    const id = props.id;
    const token = props.token;
    const cleaner = (arr) => 
    {
        const array = arr.map(solo => solo.name)
        return array.join(', ')
    }
    const reducer = (arr) => {
        const split = arr.split('');
        if(split.length > 30){
            var html = '';
            for(var i = 0; i < 30;i++){
                html += split[i]
            }   
            return html + '...';
        }
        else {
            return arr
        }
    }
    return(
        <motion.div
        transition={{layout: {duration:1, type:"spring"}}}
        animate={{
            type:"spring"
        }}
        
        layout="position" onClick={()=> setIsOpen(!isOpen)}
        >
            {!isOpen && (
                <AnimatePresence>
                <motion.div className="cardinside"initial={{
        }}
        whileHover={{
            scale:1.2
        }}
        animate={{
            type:"spring"
        }}
        transition={{
            duration:1
        }}>
                <img src={image}></img>
                        <div className="titletext">
                            <div className="titles">
                            <h1>{reducer(name)}</h1>
                            <h3>{id}</h3>
                            {Array.isArray(artists) && artists ?
                                    <h3>{cleaner(artists)}</h3>
                                    :
                                    <h3>{artists}</h3>
                            }
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            )}
            {isOpen && (
                <AnimatePresence>
                <motion.div className='expand'
                animate={{
                    type:"spring"
                }}
                transition={{
                    duration:0.5
                }}>
                    <img src={image}></img>
                        <div className="titletext">
                            <div className="titles">
                            <h1>{name}</h1>
                            <h3>{id}</h3>
                            {Array.isArray(artists) && artists ?
                                    <h3>{cleaner(artists)}</h3>
                                    :
                                    <h3>{artists}</h3>
                            }
                            </div>
                            <Stats token={token} songid={id}></Stats>
                        </div>
                </motion.div>
                </AnimatePresence>
            )}
                    
                    </motion.div>
    )
}
export default Card;