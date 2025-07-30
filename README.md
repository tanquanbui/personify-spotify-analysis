# 🎵 Personify Spotify Analysis

A browser-based app that connects to your Spotify account to visualize and analyze your music preferences — built with Node.js and Axios, no backend server required.

## ✨ Overview

This project uses the Spotify Web API to fetch user-specific data like top artists, tracks, genres, and audio features, all rendered directly in the browser. It's a lightweight, client-side tool built to explore your listening habits and discover patterns.

> ⚠️ **Note**: Since everything runs in the browser and there is no background server, some data may not load immediately — you might need to **reload the page once** for full rendering.

## 🚀 Features

- 🔐 OAuth-based login with Spotify  
- 📈 Visualize top artists, tracks, and genres  
- 🎵 Analyze audio features such as danceability, energy, valence, and more  
- 🔄 Pull data for different time ranges (short-term, medium-term, long-term)  
- 💡 Minimal setup – no backend server needed  

## 🛠️ Tech Stack

- **Node.js** (for development setup and basic routing)  
- **Axios** (for API calls)  
- **Spotify Web API** (for user data)  
- **Vanilla JS / HTML / CSS** or lightweight JS framework (depending on UI implementation)

## 🔧 Setup

### 1. Clone the repository

```bash
git clone https://github.com/tanquanbui/personify-spotify-analysis.git
cd personify-spotify-analysis
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file in the root

```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
REDIRECT_URI=http://localhost:8888/callback
```

### 4. Start the app

```bash
npm start
```

Your browser should open at `http://localhost:8888`. Click "Log in with Spotify" to authorize access.

## ⚠️ Limitations

- No backend server to cache or queue requests  
- All logic and rendering happen client-side  
- Some components may not load on first visit (due to rate limiting or async issues); a **manual refresh** often resolves this  
- Limited error handling and retry mechanisms  
- Rate limits from Spotify API may occasionally block requests  

## 📌 Notes

- This project is built for learning and demonstration purposes.  
- If you want a smoother user experience or persistent storage, consider adding a backend (e.g., Node.js/Express) and database.

## 👨‍💻 Author

Developed by [Quan Tan Bui](https://github.com/tanquanbui)  
RMIT University – Focused on Software Engineering, Cloud Computing & Web Development

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
