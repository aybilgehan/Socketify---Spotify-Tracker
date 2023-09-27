const WebSocket = require('ws');
const spotifyApi = require("../spotifyApi/spotifyHandler.js");
const { connect } = require('mongoose');

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
    console.log('New connection');
    ws.on('message', (message) => {

        console.log("alo")
        message = JSON.parse(message);
        console.log(message)

        const userSpotifyApi = spotifyApi.connectSpotify();
        spotifyApi.setInitalTokens(userSpotifyApi, message.username);
        console.log("deneme")
        console.log("alooo " + userSpotifyApi)

        spotifyApi.checkPlaying(userSpotifyApi, message.username).then((data) => {
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