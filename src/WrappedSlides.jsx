import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./Styles/Wrapped.css";

// ── Static themes for non-content slides ────────────────────────────────────
const STATIC_THEMES = [
  { bg: "#0d0d0d", accent: "#1DB954", text: "#ffffff" },
  { bg: "#1a0a1e", accent: "#c084fc", text: "#ffffff" },
  { bg: "#0a1628", accent: "#60a5fa", text: "#ffffff" },
  { bg: "#1a0c06", accent: "#fb923c", text: "#ffffff" },
  { bg: "#0a1a0e", accent: "#34d399", text: "#ffffff" },
  { bg: "#1a0a0a", accent: "#f87171", text: "#ffffff" },
];

// ── Genre → color mapping ────────────────────────────────────────────────────
const GENRE_PALETTES = [
  { keywords: ["pop", "dance pop", "teen pop", "synth-pop"], bg: "#1a0520", accent: "#f472b6", text: "#ffffff" },
  { keywords: ["hip hop", "rap", "trap", "drill", "gangsta"], bg: "#1a1400", accent: "#facc15", text: "#ffffff" },
  { keywords: ["rock", "alternative", "indie rock", "grunge", "punk"], bg: "#1a0600", accent: "#f97316", text: "#ffffff" },
  { keywords: ["electronic", "edm", "house", "techno", "electro", "dance", "dubstep"], bg: "#000d1a", accent: "#22d3ee", text: "#ffffff" },
  { keywords: ["jazz", "blues", "soul", "gospel"], bg: "#050d1a", accent: "#818cf8", text: "#ffffff" },
  { keywords: ["r&b", "neo soul", "funk", "rhythm"], bg: "#1a0018", accent: "#a78bfa", text: "#ffffff" },
  { keywords: ["classical", "orchestra", "opera", "chamber"], bg: "#0d0a1a", accent: "#c4b5fd", text: "#ffffff" },
  { keywords: ["country", "folk", "americana", "bluegrass"], bg: "#1a0e00", accent: "#fbbf24", text: "#ffffff" },
  { keywords: ["metal", "heavy", "death", "black metal", "thrash"], bg: "#0d0000", accent: "#ef4444", text: "#ffffff" },
  { keywords: ["indie", "lo-fi", "shoegaze", "dream pop"], bg: "#001a18", accent: "#2dd4bf", text: "#ffffff" },
  { keywords: ["latin", "reggaeton", "salsa", "cumbia", "bossa"], bg: "#1a0800", accent: "#fb923c", text: "#ffffff" },
  { keywords: ["k-pop", "j-pop", "anime", "j-rock"], bg: "#10001a", accent: "#e879f9", text: "#ffffff" },
];

function themeForGenre(genreName) {
  if (!genreName) return STATIC_THEMES[0];
  const lower = genreName.toLowerCase();
  for (const p of GENRE_PALETTES) {
    if (p.keywords.some((k) => lower.includes(k))) return p;
  }
  // hash-based fallback
  let h = 0;
  for (let i = 0; i < lower.length; i++) h = (h * 31 + lower.charCodeAt(i)) >>> 0;
  return STATIC_THEMES[h % STATIC_THEMES.length];
}

// ── Extract dominant palette from an image via Canvas ───────────────────────
function useImagePalette(imgUrl, fallback) {
  const [palette, setPalette] = useState(fallback);

  useEffect(() => {
    if (!imgUrl) { setPalette(fallback); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        let totalR = 0, totalG = 0, totalB = 0, totalW = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const brightness = (r + g + b) / 3;
          // skip near-black and near-white
          if (brightness < 25 || brightness > 230) continue;
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          // weight by saturation so muted greys don't dominate
          const w = saturation * saturation + 0.1;
          totalR += r * w; totalG += g * w; totalB += b * w; totalW += w;
        }
        if (totalW === 0) { setPalette(fallback); return; }

        const dr = totalR / totalW;
        const dg = totalG / totalW;
        const db = totalB / totalW;

        // dark background — very muted version
        const bg = `rgb(${Math.round(dr * 0.18)},${Math.round(dg * 0.18)},${Math.round(db * 0.18)})`;
        // vivid accent — boosted saturation
        const accentR = Math.min(255, Math.round(dr * 1.5));
        const accentG = Math.min(255, Math.round(dg * 1.5));
        const accentB = Math.min(255, Math.round(db * 1.5));
        const accent = `rgb(${accentR},${accentG},${accentB})`;
        const luminance = (0.299 * dr + 0.587 * dg + 0.114 * db) / 255;
        const text = luminance > 0.55 ? "#000000" : "#ffffff";
        setPalette({ bg, accent, text });
      } catch {
        setPalette(fallback);
      }
    };
    img.onerror = () => setPalette(fallback);
    img.src = imgUrl;
  }, [imgUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  return palette;
}

// ── Animation definitions ────────────────────────────────────────────────────
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
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { y: 48, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ── Slide components ─────────────────────────────────────────────────────────

function IntroSlide({ theme, onLogout, userProfile }) {
  const name = userProfile?.display_name?.split(" ")[0];
  const avatarUrl = userProfile?.images?.[0]?.url;
  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      <div className="ws-glow" style={{ background: theme.accent }} />
      <motion.div className="ws-content ws-center" variants={stagger} initial="hidden" animate="show">
        {avatarUrl && (
          <motion.img
            src={avatarUrl}
            alt={name || "You"}
            className="ws-avatar"
            variants={fadeUp}
            style={{ borderColor: theme.accent }}
          />
        )}
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          Personify
        </motion.p>
        <motion.h1 className="ws-headline" variants={fadeUp}>
          {name ? `${name}'s\nMusic Story` : "Your Music\nStory"}
        </motion.h1>
        <motion.p className="ws-body" variants={fadeUp} style={{ opacity: 0.65 }}>
          Your top artists, tracks &amp; sounds — right now.
          <br />Tap anywhere to continue.
        </motion.p>
      </motion.div>
      <button className="ws-logout" onClick={(e) => { e.stopPropagation(); onLogout(); }}>
        Disconnect
      </button>
    </div>
  );
}

function StatSlide({ theme, label, value, unit, sublabel }) {
  const count = useCountUp(value, true);
  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      <div className="ws-glow" style={{ background: theme.accent }} />
      <motion.div className="ws-content ws-center" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          {label}
        </motion.p>
        <motion.div className="ws-big-number" variants={fadeUp} style={{ color: theme.accent }}>
          {count}
        </motion.div>
        <motion.p className="ws-unit" variants={fadeUp}>{unit}</motion.p>
        {sublabel && (
          <motion.p className="ws-body" variants={fadeUp} style={{ opacity: 0.5, marginTop: "1.5rem", fontSize: "0.9rem" }}>
            {sublabel}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function ArtistSlide({ staticTheme, artist, rank }) {
  const rankSuffix = rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
  const label = `Your ${rank}${rankSuffix} most listened artist`;
  const img = artist.images[0]?.url;
  const theme = useImagePalette(img, staticTheme);

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
              background: `linear-gradient(to top, ${theme.bg} 30%, ${theme.bg}cc 55%, transparent 80%)`,
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
        {artist.followers?.total != null && (
          <motion.p className="ws-artist-followers" variants={fadeUp} style={{ opacity: 0.5 }}>
            {artist.followers.total.toLocaleString()} followers
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function TrackSlide({ staticTheme, track, rank }) {
  const rankSuffix = rank === 1 ? "st" : rank === 2 ? "nd" : rank === 3 ? "rd" : "th";
  const label = `Your ${rank}${rankSuffix} most played song`;
  const img = track.album?.images[0]?.url;
  const artist = track.artists?.map((a) => a.name).join(", ");
  const theme = useImagePalette(img, staticTheme);

  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      {img && (
        <motion.div
          className="ws-artist-bg"
          initial={{ scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={img} alt={track.name} style={{ objectPosition: "center center" }} />
          <div
            className="ws-artist-overlay"
            style={{
              background: `linear-gradient(to top, ${theme.bg} 40%, ${theme.bg}cc 60%, ${theme.bg}44 80%, transparent 100%)`,
            }}
          />
        </motion.div>
      )}
      <motion.div className="ws-artist-content" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          {label}
        </motion.p>
        <motion.h2 className="ws-artist-name" variants={fadeUp}>
          {track.name}
        </motion.h2>
        {artist && (
          <motion.p className="ws-artist-genre" variants={fadeUp} style={{ color: theme.accent }}>
            {artist}
          </motion.p>
        )}
        {track.album?.name && (
          <motion.p className="ws-track-album" variants={fadeUp} style={{ opacity: 0.5 }}>
            {track.album.name}
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}

function TopGenresSlide({ genres, label = "Your top sounds" }) {
  const topGenre = genres[0]?.genre || "";
  const theme = themeForGenre(topGenre);
  const sizes = ["ws-g1", "ws-g2", "ws-g3", "ws-g4", "ws-g5"];

  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      <div className="ws-glow" style={{ background: theme.accent }} />
      <motion.div className="ws-content ws-genres-content" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          {label}
        </motion.p>
        <div className="ws-genre-list">
          {genres.slice(0, 5).map((g, i) => {
            const gt = themeForGenre(g.genre);
            return (
              <motion.p
                key={g.genre}
                className={`ws-genre-item ${sizes[i]}`}
                variants={fadeUp}
                style={{ color: i === 0 ? gt.accent : theme.text, opacity: 1 - i * 0.14 }}
              >
                {g.genre}
              </motion.p>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function PopularitySlide({ staticTheme, topArtists, topTracks }) {
  const avgArtistPop = topArtists.length
    ? Math.round(topArtists.reduce((s, a) => s + (a.popularity || 0), 0) / topArtists.length)
    : 0;
  const avgTrackPop = topTracks.length
    ? Math.round(topTracks.reduce((s, t) => s + (t.popularity || 0), 0) / topTracks.length)
    : 0;
  const overallScore = Math.round((avgArtistPop + avgTrackPop) / 2);

  const vibe =
    overallScore >= 80 ? "You love what's on the charts." :
    overallScore >= 60 ? "You keep it pretty mainstream." :
    overallScore >= 40 ? "A nice mix of known and niche." :
    "Total deep cut connoisseur.";

  const count = useCountUp(overallScore, true);

  return (
    <div className="ws-slide" style={{ background: staticTheme.bg, color: staticTheme.text }}>
      <div className="ws-glow" style={{ background: staticTheme.accent }} />
      <motion.div className="ws-content ws-center" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: staticTheme.accent }}>
          Your mainstream score
        </motion.p>
        <motion.div className="ws-big-number" variants={fadeUp} style={{ color: staticTheme.accent }}>
          {count}
        </motion.div>
        <motion.p className="ws-unit" variants={fadeUp}>out of 100</motion.p>
        <motion.p className="ws-body" variants={fadeUp} style={{ opacity: 0.65, marginTop: "1.5rem" }}>
          {vibe}
        </motion.p>
      </motion.div>
    </div>
  );
}

function DiversitySlide({ staticTheme, allTimeGenres, recentGenres }) {
  const allTimeCount = useCountUp(allTimeGenres, true, 1200);
  const recentCount = useCountUp(recentGenres, true, 1400);

  return (
    <div className="ws-slide" style={{ background: staticTheme.bg, color: staticTheme.text }}>
      <div className="ws-glow" style={{ background: staticTheme.accent }} />
      <motion.div className="ws-content ws-center" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: staticTheme.accent }}>
          Your musical range
        </motion.p>
        <motion.div className="ws-diversity-row" variants={fadeUp}>
          <div className="ws-diversity-col">
            <div className="ws-diversity-num" style={{ color: staticTheme.accent }}>{allTimeCount}</div>
            <div className="ws-diversity-label" style={{ opacity: 0.6 }}>genres all time</div>
          </div>
          <div className="ws-diversity-divider" style={{ background: staticTheme.accent }} />
          <div className="ws-diversity-col">
            <div className="ws-diversity-num" style={{ color: staticTheme.accent }}>{recentCount}</div>
            <div className="ws-diversity-label" style={{ opacity: 0.6 }}>genres lately</div>
          </div>
        </motion.div>
        <motion.p className="ws-body" variants={fadeUp} style={{ opacity: 0.55, marginTop: "2rem" }}>
          {recentGenres > allTimeGenres * 0.8
            ? "You're still exploring everything."
            : recentGenres < allTimeGenres * 0.4
            ? "You've been going deep on a few things lately."
            : "A nice balance of familiar and new."}
        </motion.p>
      </motion.div>
    </div>
  );
}

function OutroSlide({ theme, userProfile }) {
  const name = userProfile?.display_name?.split(" ")[0];
  return (
    <div className="ws-slide" style={{ background: theme.bg, color: theme.text }}>
      <div className="ws-glow" style={{ background: theme.accent }} />
      <motion.div className="ws-content ws-center" variants={stagger} initial="hidden" animate="show">
        <motion.p className="ws-label" variants={fadeUp} style={{ color: theme.accent }}>
          That&apos;s a wrap{name ? `, ${name}` : ""}
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

export default function WrappedSlides({ topArtists, topTracks, recentTracks, genresByRange, userProfile, onLogout }) {
  const allTimeGenres = genresByRange["long_term"] || [];
  const recentGenres = genresByRange["short_term"] || [];

  const slides = [
    { type: "intro" },
    ...(allTimeGenres.length
      ? [{ type: "stat", label: "You've explored", value: allTimeGenres.length, unit: "different genres", sublabel: "across your entire Spotify history", themeIdx: 1 }]
      : []),
    ...topArtists.slice(0, 5).map((artist, i) => ({ type: "artist", artist, rank: i + 1, themeIdx: i + 2 })),
    ...(allTimeGenres.length ? [{ type: "genres", genres: allTimeGenres }] : []),
    ...topTracks.slice(0, 5).map((track, i) => ({ type: "track", track, rank: i + 1, themeIdx: i + 2 })),
    ...(topArtists.length && topTracks.length
      ? [{ type: "popularity", topArtists, topTracks, themeIdx: 3 }]
      : []),
    ...(allTimeGenres.length && recentGenres.length
      ? [{ type: "diversity", allTimeGenres: allTimeGenres.length, recentGenres: recentGenres.length, themeIdx: 4 }]
      : []),
    ...(recentGenres.length ? [{ type: "recentGenres", genres: recentGenres }] : []),
    { type: "outro" },
  ];

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Static theme used only for progress bar, arrows, and non-image slides
  const staticTheme = STATIC_THEMES[index % STATIC_THEMES.length];

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

  // Touch swipe detection
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const didSwipe = useRef(false);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    didSwipe.current = false;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // only count as swipe if horizontal movement dominates and exceeds threshold
    if (Math.abs(dx) > Math.abs(dy) * 1.3 && Math.abs(dx) > 48) {
      didSwipe.current = true;
      go(dx < 0 ? 1 : -1);
    }
    touchStartX.current = null;
  };

  const handleClick = (e) => {
    // ignore click that was the end of a swipe
    if (didSwipe.current) { didSwipe.current = false; return; }
    const x = e.clientX;
    const w = window.innerWidth;
    go(x > w / 2 ? 1 : -1);
  };

  const slide = slides[index];

  return (
    <div
      className="ws-root"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress segments */}
      <div className="ws-progress">
        {slides.map((_, i) => (
          <div key={i} className="ws-progress-seg">
            <motion.div
              className="ws-progress-fill"
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
          {slide.type === "intro" && (
            <IntroSlide theme={staticTheme} onLogout={onLogout} userProfile={userProfile} />
          )}
          {slide.type === "stat" && (
            <StatSlide
              theme={STATIC_THEMES[slide.themeIdx % STATIC_THEMES.length]}
              label={slide.label}
              value={slide.value}
              unit={slide.unit}
              sublabel={slide.sublabel}
            />
          )}
          {slide.type === "artist" && (
            <ArtistSlide
              staticTheme={STATIC_THEMES[slide.themeIdx % STATIC_THEMES.length]}
              artist={slide.artist}
              rank={slide.rank}
            />
          )}
          {slide.type === "track" && (
            <TrackSlide
              staticTheme={STATIC_THEMES[slide.themeIdx % STATIC_THEMES.length]}
              track={slide.track}
              rank={slide.rank}
            />
          )}
          {slide.type === "genres" && (
            <TopGenresSlide genres={slide.genres} label="Your top sounds" />
          )}
          {slide.type === "recentGenres" && (
            <TopGenresSlide genres={slide.genres} label="What you've been into lately" />
          )}
          {slide.type === "popularity" && (
            <PopularitySlide
              staticTheme={STATIC_THEMES[slide.themeIdx % STATIC_THEMES.length]}
              topArtists={slide.topArtists}
              topTracks={slide.topTracks}
            />
          )}
          {slide.type === "diversity" && (
            <DiversitySlide
              staticTheme={STATIC_THEMES[slide.themeIdx % STATIC_THEMES.length]}
              allTimeGenres={slide.allTimeGenres}
              recentGenres={slide.recentGenres}
            />
          )}
          {slide.type === "outro" && (
            <OutroSlide
              theme={STATIC_THEMES[(slides.length - 1) % STATIC_THEMES.length]}
              userProfile={userProfile}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Arrow hints */}
      <div className="ws-nav-hint">
        <span style={{ opacity: index > 0 ? 0.4 : 0 }}>◀</span>
        <span style={{ opacity: index < slides.length - 1 ? 0.4 : 0 }}>▶</span>
      </div>
    </div>
  );
}
