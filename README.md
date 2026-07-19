# Personify

A Spotify Wrapped-style story experience for your music taste — built with React, framer-motion, and the Spotify Web API.

## What it does

After logging in with Spotify, you get a full-screen animated slide deck showing:

- **Your top 5 artists** — full-bleed photo, genre tags, follower count
- **Your top 5 tracks** — album art, artist, album name
- **Genre breakdown** — all-time and recently (short-term)
- **Mainstream score** — average popularity of your top artists and tracks
- **Musical range** — all-time vs recent genre count comparison
- Personalized with your Spotify display name and avatar

Every artist and track slide auto-extracts the dominant color from the image and builds a unique dark background + vivid accent from it. Genre slides pick a palette based on the genre (hip-hop → gold, pop → pink, EDM → cyan, jazz → indigo, etc.).

## Tech stack

- React (Create React App)
- framer-motion — slide transitions and staggered text animations
- Spotify Web API — Authorization Code flow with PKCE-style state validation
- Netlify Functions — serverless token exchange and refresh (no exposed secrets)
- D3 — genre bubble visualization (legacy view)

## Local development

1. Clone the repo
2. Copy `.env.example` to `.env.local` and fill in your values:
   ```
   REACT_APP_CLIENT_ID=your_spotify_client_id
   REACT_APP_REDIRECT_URI=http://localhost:3000/callback
   ```
3. Set the same values as environment variables for the Netlify Functions:
   ```
   CLIENT_ID=your_spotify_client_id
   CLIENT_SECRET=your_spotify_client_secret
   REDIRECT_URI=http://localhost:3000/callback
   ```
4. Install and run:
   ```bash
   npm install
   npm start
   ```

The dev server proxies `/api/*` requests to `http://localhost:4000`. To run the functions locally, use the [Netlify CLI](https://docs.netlify.com/cli/get-started/):

```bash
npx netlify dev
```

## Deployment (Netlify)

1. Connect the repo to Netlify
2. Set these environment variables in **Netlify → Site settings → Environment variables**:
   - `CLIENT_ID` — your Spotify app client ID
   - `CLIENT_SECRET` — your Spotify app client secret
   - `REDIRECT_URI` — e.g. `https://your-site.netlify.app/callback`
   - `REACT_APP_CLIENT_ID` — same as `CLIENT_ID`
   - `REACT_APP_REDIRECT_URI` — same as `REDIRECT_URI`
3. Register your `REDIRECT_URI` in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
4. Deploy — Netlify will run `npm ci && npm run build` automatically

## Required Spotify scopes

- `user-top-read` — top artists and tracks
- `user-read-private` — display name and avatar
