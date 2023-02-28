import '../../Styles/Cards.css'
import { motion } from 'framer-motion';
import { useState } from "react";
const Card =(props)=>{
    const [isOpen, setIsOpen] = useState(false);
    const image = props.image;
    const name = props.name
    const artists = props.artists;
    const id = props.id;
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
        layout="position" onClick={()=> setIsOpen(!isOpen)}
        >
            {!isOpen && (
                <motion.div className="cardinside"initial={{
            scale:0.8
        }}
        whileHover={{
            scale:1
        }}
        animate={{
            type:"spring"
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
            )}
            {isOpen && (
                <motion.div className='expand'
                transition={{ delay: 1 }}
                >
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
                        </div>
                </motion.div>
            )}
                    
                    </motion.div>
    )
}
export default Card;