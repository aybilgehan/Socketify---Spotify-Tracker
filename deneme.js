const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const WebSocket = require('ws'); // Import the ws library
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();
const PORT = process.env.PORT || 8080;

const SPOTIFY_CLIENT_ID = '206b594b54644226957f281d9818d424';
const SPOTIFY_CLIENT_SECRET = '332b8796a2d84ab5ae74720fe0c6e380';
const REDIRECT_URI = 'http://localhost:8080/callback'; // Update this with your actual redirect URI

// Create an HTTP server with Express
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Create a WebSocket server that attaches to the HTTP server
const wss = new WebSocket.Server({ noServer: true });

// Handle WebSocket connections
wss.on('connection', (ws) => {
    console.log('New connection');
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        const spotifyApi = new SpotifyWebApi({ 
            clientId: SPOTIFY_CLIENT_ID,
            clientSecret: SPOTIFY_CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
        });
        spotifyApi.setAccessToken(message);

        setInterval(() => {
            spotifyApi.getMyCurrentPlayingTrack()
            .then(function(data) {
                if(data.body.item && data.body.is_playing) {
                    ws.send(JSON.stringify(
                        {
                            "name": data.body.item.name,
                            "artist": data.body.item.artists[0].name,
                            "image": data.body.item.album.images[0].url
                        }
                    ))
                }else{
                    ws.send(JSON.stringify(
                        {
                            "name": " -",
                            "artist": " -",
                            "image": ""
                        }
                    ))
                }
            }, function(err) {
                console.log('Something went wrong!', err);
            });
        }, 1000);
    });
});

// Set up a basic Express server
app.use(express.static('public'));

app.get('/login', (req, res) => {
    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: 'user-read-private user-read-email user-read-currently-playing', // Adjust scopes as needed
        redirect_uri: REDIRECT_URI,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;

    // Exchange the code for an access token
    const tokenParams = querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
    });

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', tokenParams, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const { access_token, refresh_token } = response.data;

        res.render("index.twig", { access_token, refresh_token });

    } catch (error) {
        console.error(error);
        res.send('Error');
    }
});

// Upgrade incoming HTTP requests to WebSocket connections
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});
