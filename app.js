const express = require('express');
const app = express();
const session = require("express-session");
require('dotenv').config();
const dataBase = require('./dbHandler/dbHandler');
const socketIo = require('socket.io');
const spotifyApi = require("./spotifyApi/spotifyHandler.js");
const http = require('http');
const dbHandler = require('./dbHandler/dbHandler');

// Connect to DB
dataBase.connect();

// Import routes
const pageRouter = require('./routes/page.router');

// Create an HTTP server
const server = http.createServer(app);

// Middlewares
app.use(express.static(__dirname + '/'));
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

// Create a Socket.io instance attached to the HTTP server
const io = socketIo(server);

const hebele = {}
io.on('connection', (socket) => {
    console.log('New connection');
    var userSpotifyApi;
    socket.on('join', async (username) => {
        console.log("username geldi " + username)
        if (hebele.hasOwnProperty(username)) {
            console.log("girdi")
            socket.emit("duplicate");
            return;
        }
        hebele[username] = socket;
        userSpotifyApi = await spotifyApi.connectSpotify(username);
        socket.emit("track", userSpotifyApi.getAccessToken());
        //spotifyApi.denemeCheckPlaying(socket, userSpotifyApi, username);
    });

    socket.on('refreshToken', async (username) => {
        userSpotifyApi.refreshAccessToken().then((data) => {
            console.log("geldi")
            userSpotifyApi.setAccessToken(data.body['access_token']);
            dbHandler.updateAccessToken(username, data.body['access_token']);
            socket.emit("track", data.body['access_token']);
        })
    });

    socket.on('disconnect', () => {
        console.log('Connection closed');
        // Remove the socket from the hebele object on disconnect
        const username = Object.keys(hebele).find(key => hebele[key] === socket);
        if (username) {
            delete hebele[username];
        }
        console.log(hebele)
    });
});

exports.send = function () {
    console.log("sea")
    for (const [key, value] of Object.entries(hebele)) {
        value.emit("konfeti");
        return;
    }
}

exports.disconnectUserWhenUrlRefreshed = function (username) {
    if (hebele.hasOwnProperty(username)) {
        hebele[username].disconnect();
    }
}

server.listen(process.env.SOCKET_PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.SOCKET_PORT}`);
});
