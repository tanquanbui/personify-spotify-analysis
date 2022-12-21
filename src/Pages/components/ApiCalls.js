import axios from "axios"
import { useEffect, useState } from "react";
const token = localStorage.getItem("token");
export const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
}

/*----------  User API Calls  ----------*/

export const getUser = () => axios.get('https://api.spotify.com/v1/me', { headers })

export const getUsersTop5Artists = () => axios.get('https://api.spotify.com/v1/me/top/artists?limit=9&time_range=long_term', {headers})
export const getUsersTopArtists = () => (axios.get('https://api.spotify.com/v1/me/top/artists?limit=15', {headers}))
export const getUsersTopArtistsSinceWeeks = () => axios.get('https://api.spotify.com/v1/me/top/artists?limit=15&time_range=short_term', {headers})
export const getUsersTopArtistsSinceAnYear = () => axios.get('https://api.spotify.com/v1/me/top/artists?limit=15&time_range=long_term', {headers})

export const getUsersTop5Tracks = () => axios.get('https://api.spotify.com/v1/me/top/tracks?limit=9&time_range=long_term&limit=4', {headers})
export const getUsersTopTracks = () => axios.get('https://api.spotify.com/v1/me/top/tracks?limit=9', {headers})
export const getUsersTopTracksSinceWeeks = () => axios.get('https://api.spotify.com/v1/me/top/tracks?limit=9&time_range=short_term', {headers})
export const getUsersTopTracksSinceAnYear = () => axios.get('https://api.spotify.com/v1/me/top/tracks?limit=15&time_range=long_term', {headers})

export const getFollowing = () => axios.get('https://api.spotify.com/v1/me/following?type=artist', { headers })

export const getRecentlyPlayed = () => axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=10', { headers })

export const getPlaylists = () => axios.get('https://api.spotify.com/v1/me/playlists', {headers})





/*----------  Artists API Calls  ----------*/

export const getArtist = (id) => axios.get(`https://api.spotify.com/v1/artists/${id}`, {headers})

export const getArtistsTopTracks = (id) => axios.get(`https://api.spotify.com/v1/artists/${id}/top-tracks?market=IN`, {headers})

export const getArtistsAlbums = id => axios.get(`https://api.spotify.com/v1/artists/${id}/albums?limit=30&include_groups=album`, {headers})

export const getArtistsRelatedArtists = id => axios.get(`https://api.spotify.com/v1/artists/${id}/related-artists?limit=5`, {headers})

export const isArtistFollowedByUser = id => axios.get(`https://api.spotify.com/v1/me/following/contains?type=artist&ids=${id}`, {headers})

export const followArtist = id => axios.put(`https://api.spotify.com/v1/me/following?type=artist`, {ids:[id]}, {headers})

export const unfollowArtist = id => axios.delete(`https://api.spotify.com/v1/me/following?type=artist&ids=${id}`, {headers})




/*----------  Track API Calls  ----------*/

export const getSong = id => axios.get(`https://api.spotify.com/v1/tracks/${id}`, {headers})

export const getSongFeatures = id => axios.get(`https://api.spotify.com/v1/audio-features/${id}`, {headers})

export const getTracksFeatures = ids => axios.get(`https://api.spotify.com/v1/audio-features?ids=${ids}`, {headers})




/*----------  Library API Calls  ----------*/

export const getLikedSongs = () => axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {headers})

export const getUsersPodcasts = () => axios.get('https://api.spotify.com/v1/me/shows', {headers})

export const getUsersPlaylists = () => axios.get('https://api.spotify.com/v1/me/playlists', {headers})

export const getAPodcast = id => axios.get(`https://api.spotify.com/v1/shows/${id}`, {headers})

export const getAPlaylist = id => axios.get(`https://api.spotify.com/v1/playlists/${id}`, {headers})

export const getAPlaylistsTracks = id => axios.get(`https://api.spotify.com/v1/playlists/${id}/tracks`, {headers})

export const getAnAlbum = id => axios.get(`https://api.spotify.com/v1/albums/${id}`, {headers})

export const getAnAlbumsTracks = id => axios.get(`https://api.spotify.com/v1/albums/${id}/tracks`, {headers})
