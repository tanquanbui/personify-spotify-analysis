require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID || 'YOUR_CLIENT_ID';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/callback'; // Must rigidly match frontend
const PORT = process.env.PORT || 4000;

const basicAuthHeader = 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

// Endpoint to securely exchange the authorization code for an access token
app.post("/api/exchange", async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ error: 'Code is required' });
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': basicAuthHeader
                }
            });

        res.json(response.data);
    } catch (error) {
        console.error('Error exchanging authorization code for token:', error.response?.data || error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to exchange a refresh token for a new access token
app.post("/api/refresh", async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ error: 'refresh_token is required' });
    }

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': basicAuthHeader
                }
            });

        res.json(response.data);
    } catch (error) {
        console.error('Error refreshing access token:', error.response?.data || error.message);
        res.status(401).json({ error: 'Could not refresh token' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
