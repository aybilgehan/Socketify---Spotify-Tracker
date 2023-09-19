const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const client_secret = "332b8796a2d84ab5ae74720fe0c6e380";

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

wss.on('connection', function connection(ws) {
    console.log('New connection');
    var scopes = ['user-read-private', 'user-read-email'],
        redirectUri = 'http://localhost:8080/callback',
        clientId = "206b594b54644226957f281d9818d424",
        state = generateRandomString(16),
        showDialog = true,
        responseType = 'token';

    // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
    var spotifyApi = new SpotifyWebApi({
        redirectUri: redirectUri,
        clientId: clientId
    });

    // Create the authorization URL
    var authorizeURL = spotifyApi.createAuthorizeURL(
        scopes,
        state,
        showDialog,
        responseType
    );

    app.get('/', function(req, res) {
        res.send("Hello World");
    });

    app.get('/login', function(req, res) {
        res.redirect(authorizeURL);
    });


});


server.listen(8080, function listening() {
    console.log('Listening on %d', server.address().port);
}
);

app.listen(3000, () => console.log('Server started on port 8080'));