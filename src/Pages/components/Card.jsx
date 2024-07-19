import "../../Styles/Cards.css";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import Stats from "./Stats";
import TrackFeatures from "./TrackFeatures"

const Card = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const cardRef = useRef(null);
  const { image, name, artists, id, apilink, token } = props;

  useEffect(() => {
    if (isOpen && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isOpen]);

  const cleaner = (arr) => arr.map((solo) => solo.name).join(", ");

  const reducer = (arr) => {
    const split = arr.split("");
    if (split.length > 25) {
      var html = "";
      for (var i = 0; i < 25; i++) {
        html += split[i];
      }
      return html + "...";
    } else {
      return arr;
    }
  };

  return (
    <motion.div
      ref={cardRef}
      whileHover={{ scale: isOpen ? 1 : 1.1 }} // Zoom effect on hover
      transition={{ duration: 0.3 }}
      onClick={() => setIsOpen(!isOpen)}
      className={`card-container ${isOpen ? 'expanded' : ''}`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="fullscreen"
          >
            <motion.div
              className="expand"
              animate={{
                type: "spring",
              }}
              transition={{
                duration: 0.5,
              }}
              initial={{}}
            >
              <div>
              <img src={image} alt={name}></img>
              <h1>{name}</h1>
              {Array.isArray(artists) && artists ? (
                  <h3>{cleaner(artists)}</h3>
                ) : (
                  <h3>{artists}</h3>
                )}
                <TrackFeatures token={token} trackId={id} apiLink={apilink} />
              </div>
              
              <div className="titletext">
                <Stats token={token} songid={id} apilink={apilink} />
              </div>
            </motion.div>
          </motion.div>
        )}
        {!isOpen && (
          <motion.div
            className="cardinside"
            initial={{}}
            animate={{
              type: "spring",
            }}
            transition={{
              duration: 0.6,
            }}
          >
            <div className="images">
              <img src={image} alt={name}></img>
            </div>
            <div>
              <div className="titles">
                <h1>{name}</h1>
                {Array.isArray(artists) && artists ? (
                  <h3>{cleaner(artists)}</h3>
                ) : (
                  <h3>{artists}</h3>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Card;
