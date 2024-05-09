const express = require('express');
const axios = require('axios');

const app = express();

const CLIENT_ID = '7f112c4cfe524c218620897ff68ecfc6';
const CLIENT_SECRET = '306d676feec54b08a1570abb1d';
const REDIRECT_URI = 'http://localhost:4000/callback'; // Your redirect URI

// Route to initiate the login process
app.get("/login", (req, res) => {
    const scopes = 'user-read-private user-read-email'; // Specify the scopes you need
    const authorizeUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${encodeURIComponent(scopes)}`;
    res.redirect(authorizeUrl);
});

// Callback route to handle the authorization code
app.get("/callback", async (req, res) => {
    const { code } = req.query;

    try {
        // Exchange authorization code for access token
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
                }
            });

        const { access_token, refresh_token } = response.data;

        // Now you have access_token and refresh_token, you can save them for subsequent requests
        // Typically, you would associate them with the user who just logged in

        res.send("Login successful! You can now access protected resources.");
    } catch (error) {
        console.error('Error exchanging authorization code for token:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(4000, () => {
    console.log("Server running on port 4000");
});