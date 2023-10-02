const express = require('express');
const app = express();
const session = require("express-session");
require('dotenv').config();
const dataBase = require('./dbHandler/dbHandler');
const WebSocket = require('ws');
const spotifyApi = require("./spotifyApi/spotifyHandler.js");
const pageController = require("./page.controller/page.controller.js");


// Connect to DB
dataBase.connect();

// Import routes
const pageRouter = require('./routes/page.router');
const { set } = require('mongoose');

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

const hebele = {}
wss.on('connection', (ws) => {
    console.log('New connection');
    ws.on('message', async (message) => {
        const username = message.toString();
        if(hebele.hasOwnProperty(username)){
            ws.terminate();
            return;
        }
        hebele[username] = ws;
        console.log(hebele);
        const userSpotifyApi = await spotifyApi.connectSpotify(username);
        spotifyApi.checkPlaying(ws, userSpotifyApi, username);
    }) 

    ws.on('close', () => {
        console.log('Connection closed');
        
    });
});


exports.send = function (){
    console.log("sea")
    for (const [key, value] of Object.entries(hebele)) {
        value.send("deneme");
    }
}

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});