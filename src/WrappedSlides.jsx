import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Styles/Wrapped.css";

const THEMES = [
  { bg: "#121212", accent: "#1DB954", text: "#ffffff" },
  { bg: "#E8115B", accent: "#FFFD82", text: "#ffffff" },
  { bg: "#3D6FFF", accent: "#FFFD82", text: "#ffffff" },
  { bg: "#FF6437", accent: "#FFFD82", text: "#ffffff" },
  { bg: "#7358FF", accent: "#FFE2CE", text: "#ffffff" },
  { bg: "#FFFD82", accent: "#E8115B", text: "#000000" },
  { bg: "#25D0AB", accent: "#121212", text: "#ffffff" },
  { bg: "#E8115B", accent: "#FFFD82", text: "#ffffff" },
  { bg: "#3D6FFF", accent: "#FFFD82", text: "#ffffff" },
  { bg: "#121212", accent: "#1DB954", text: "#ffffff" },
];

function useCountUp(target, active, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) { setValue(0); return; }
    setValue(0);
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return value;
}

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { y: 48, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ── Slide components ────────────────────────────────────────────────────────

function IntroSlide({ theme, onLogout }) {
  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      <div className="ws-glow" style={{ background: theme.accent }} />
      <motion.div className="ws-content ws-center" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          Personify
        </motion.p>
        <motion.h1 className="ws-headline" variants={fadeUp}>
          Your Music<br />Story
        </motion.h1>
        <motion.p className="ws-body" variants={fadeUp} style={{ opacity: 0.65 }}>
          Your top artists and sounds, right now.
          <br />Tap anywhere to continue.
        </motion.p>
      </motion.div>
      <button className="ws-logout" onClick={(e) => { e.stopPropagation(); onLogout(); }}>
        Disconnect
      </button>
    </div>
  );
}

function StatSlide({ theme, label, value, unit }) {
  const count = useCountUp(value, true);
  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      <motion.div className="ws-content ws-center" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          {label}
        </motion.p>
        <motion.div className="ws-big-number" variants={fadeUp} style={{ color: theme.accent }}>
          {count}
        </motion.div>
        <motion.p className="ws-unit" variants={fadeUp}>
          {unit}
        </motion.p>
      </motion.div>
    </div>
  );
}

function ArtistSlide({ theme, artist, rank }) {
  const rankSuffix = rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
  const label = `Your ${rank}${rankSuffix} most listened artist`;
  const img = artist.images[0]?.url;

  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      {img && (
        <motion.div
          className="ws-artist-bg"
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={img} alt={artist.name} />
          <div
            className="ws-artist-overlay"
            style={{
              background: `linear-gradient(to top, ${theme.bg} 30%, ${theme.bg}99 55%, transparent 80%)`,
            }}
          />
        </motion.div>
      )}
      <motion.div className="ws-artist-content" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          {label}
        </motion.p>
        <motion.h2 className="ws-artist-name" variants={fadeUp}>
          {artist.name}
        </motion.h2>
        {artist.genres?.length > 0 && (
          <motion.p className="ws-artist-genre" variants={fadeUp} style={{ color: theme.accent }}>
            {artist.genres.slice(0, 2).join(" · ")}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function TopGenresSlide({ theme, genres }) {
  const sizes = ["ws-g1", "ws-g2", "ws-g3", "ws-g4", "ws-g5"];
  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      <motion.div className="ws-content ws-genres-content" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          Your top sounds
        </motion.p>
        <div className="ws-genre-list">
          {genres.slice(0, 5).map((g, i) => (
            <motion.p
              key={g.genre}
              className={`ws-genre-item ${sizes[i]}`}
              variants={fadeUp}
              style={{ color: i === 0 ? theme.accent : theme.text, opacity: 1 - i * 0.14 }}
            >
              {g.genre}
            </motion.p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function OutroSlide({ theme }) {
  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      <div className="ws-glow" style={{ background: theme.accent }} />
      <motion.div className="ws-content ws-center" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          That&apos;s a wrap
        </motion.p>
        <motion.h1 className="ws-headline" variants={fadeUp}>
          Your taste,<br />defined.
        </motion.h1>
        <motion.p className="ws-body" variants={fadeUp} style={{ opacity: 0.65 }}>
          Come back anytime to see how your sound evolves.
        </motion.p>
      </motion.div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function WrappedSlides({ topArtists, genresByRange, onLogout }) {
  const genres = genresByRange["long_term"] || [];

  const slides = [
    { type: "intro" },
    ...(genres.length ? [{ type: "stat", label: "You explored", value: genres.length, unit: "different genres" }] : []),
    ...topArtists.slice(0, 5).map((artist, i) => ({ type: "artist", artist, rank: i + 1 })),
    ...(genres.length ? [{ type: "genres", genres }] : []),
    { type: "outro" },
  ];

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const theme = THEMES[index % THEMES.length];

  const go = useCallback(
    (dir) => {
      const next = index + dir;
      if (next < 0 || next >= slides.length) return;
      setDirection(dir);
      setIndex(next);
    },
    [index, slides.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const handleClick = (e) => {
    const x = e.clientX;
    const w = window.innerWidth;
    go(x > w / 2 ? 1 : -1);
  };

  const slide = slides[index];

  return (
    <div className="ws-root" onClick={handleClick}>
      {/* Progress segments */}
      <div className="ws-progress">
        {slides.map((_, i) => (
          <div key={i} className="ws-progress-seg">
            <motion.div
              className="ws-progress-fill"
              style={{ background: theme.text === "#000000" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.9)" }}
              animate={{ scaleX: i <= index ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        ))}
      </div>

      {/* Slides */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          style={{ position: "absolute", inset: 0 }}
        >
          {slide.type === "intro" && <IntroSlide theme={theme} onLogout={onLogout} />}
          {slide.type === "stat" && (
            <StatSlide theme={theme} label={slide.label} value={slide.value} unit={slide.unit} />
          )}
          {slide.type === "artist" && (
            <ArtistSlide theme={theme} artist={slide.artist} rank={slide.rank} />
          )}
          {slide.type === "genres" && <TopGenresSlide theme={theme} genres={slide.genres} />}
          {slide.type === "outro" && <OutroSlide theme={theme} />}
        </motion.div>
      </AnimatePresence>

      {/* Arrow hints */}
      <div className="ws-nav-hint">
        <span style={{ color: theme.text, opacity: index > 0 ? 0.35 : 0 }}>◀</span>
        <span style={{ color: theme.text, opacity: index < slides.length - 1 ? 0.35 : 0 }}>▶</span>
      </div>
    </div>
  );
}
