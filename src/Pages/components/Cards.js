import React from "react";
import '../../Styles/Cards.css'
function Cards(props) {
    const datas = props.datas;
    console.log(datas)
    const cleaner = (arr) => 
    {
        const array = arr.map(solo => solo.name)
        return array.join(', ')
    }
    if(props.type === "tracks"){
        return(
            <div className="outside">
         {datas.map((art) => (
                <div className="card">
                    <div className="cardinside">
                    <img src={art.album.images[0].url}></img>
                        <div className="titletext">
                            <div className="titles">
                            <h1>{art.name}</h1>
                            {Array.isArray(art.artists) && art.artists ?
                                    <h3>{cleaner(art.artists)}</h3>
                                    :
                                    <h3>{art.artists}</h3>
                            }
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            </div>
            )
    }
    
    if(props.type === "artists"){

    }
    }
export default Cards;