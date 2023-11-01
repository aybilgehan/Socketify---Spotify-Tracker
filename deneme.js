const express = require('express');
const app = express();
const session = require("express-session");
require('dotenv').config();
const dataBase = require('./dbHandler/dbHandler');
const socketIo = require('socket.io');
const http = require('http');
const webSocket = require("./webSocket/webSocket.js")

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

io.on('connection', (socket) => {
    socket.on('join', async (username) => {
        webSocket.connection(socket, username);
    });

    socket.on('refreshToken', async (username) => {
        webSocket.refreshToken(socket, username);
    });

    socket.on('disconnect', () => {
        webSocket.disconnect(socket);
    });
});


server.listen(process.env.SOCKET_PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.SOCKET_PORT}`);
});
