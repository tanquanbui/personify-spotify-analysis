import React from "react";
function Cards(props) {
    const cleaner = (arr) => 
    {
        const array = arr.map(solo => solo.name)
        return array.join(', ')
    }
    return props.datas.map((art) => (
        <div className="">
            <img src={art.album.images[0].url}></img>
            <div>
            {art.name}
            {Array.isArray(art.artists) && art.artists ?
					<h3>{cleaner(art.artists)}</h3>
					:
					<h3>{art.artists}</h3>
			}
            </div>
        </div>
    ))
    // if(props.type === "artists"){

    // }
    }
export default Cards;