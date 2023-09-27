const express = require('express');
const app = express();
const session = require("express-session");
require('dotenv').config();
const dataBase = require('./dbHandler/dbHandler');
const WebSocket = require('ws');
const spotifyApi = require("./spotifyApi/spotifyHandler.js");


// Connect to DB
dataBase.connect();

// Import routes
const pageRouter = require('./routes/page.router');

// Middlewares
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}))
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}))   

// Set view engine
app.set('view engine', 'twig');

// Routes
app.use("/", pageRouter);


const server = app.listen(process.env.SOCKET_PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.SOCKET_PORT}`);
});

const wss = new WebSocket.Server({ noServer: true });
const hebele = [];

wss.on('connection', (ws) => {
    hebele.push(ws)
    console.log('New connection');
    ws.on('message', (message) => {

        username = message.toString();
        const userSpotifyApi = spotifyApi.connectSpotify();
        spotifyApi.setInitalTokens(userSpotifyApi, username);
        console.log(userSpotifyApi)

        spotifyApi.checkPlaying(userSpotifyApi, username).then((data) => {
            ws.send(data);
        })

    ws.on('close', () => {
        console.log('Connection closed');
        
    });
})
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});