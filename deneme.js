const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const WebSocket = require('ws'); // Import the ws library
const SpotifyWebApi = require('spotify-web-api-node');
const session = require('express-session');
const pageRoute = require("../Socketify/routes/page.router");
require('dotenv').config();1


const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const SPOTIFY_CLIENT_ID =  process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  }))
app.set("view engine", "twig");


const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('New connection');
    ws.on('message', (message) => {
        const spotifyApi = new SpotifyWebApi({ 
            clientId: SPOTIFY_CLIENT_ID,
            clientSecret: SPOTIFY_CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
        });

        message = JSON.parse(message);
        spotifyApi.setAccessToken(message.accessToken);
        spotifyApi.setRefreshToken(message.refreshToken);

        setInterval(() => {
            spotifyApi.refreshAccessToken().then((data) => {
                spotifyApi.setAccessToken(data.body['access_token']);
                console.log('The access token has been refreshed!');
        })}, 1000*59*59);

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

    ws.on('close', () => {
        console.log('Connection closed');
        
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
        req.session.accessToken = response.data.access_token;
        req.session.refreshToken = response.data.refresh_token;

        res.redirect('/track');

    } catch (error) {
        console.error(error);
        res.send('Error');
    }
});

app.get('/track', async (req, res) => {
    console.log(req.session.accessToken);
    res.render("index.twig", { accessToken: req.session.accessToken, refreshToken: req.session.refreshToken});
});
app.use("/", pageRoute);
// Upgrade incoming HTTP requests to WebSocket connections
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});