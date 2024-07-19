import React from "react";
import { motion } from "framer-motion";
import "../../Styles/Albums.css";

const Albums = ({ albums }) => {
  return (
    <div>
      <h2>Albums</h2>
      <div className="albums-container">
        <div className="albums">
          {albums.map((album) => (
            <motion.div
              className="album"
              key={album.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <img src={album.images[0]?.url} alt={album.name} />
              <p>{album.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Albums;
