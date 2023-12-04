require('dotenv').config();
const spotifyApi = require("../spotifyApi/spotifyHandler.js");
const dbHandler = require('../dbHandler/dbHandler.js');



const users = {}

exports.connection = async function (socket, username) {
    var userSpotifyApi;

    userSpotifyApi = await spotifyApi.connectSpotify(username);
    users[username] = { "socket": socket, "spotifyApi": userSpotifyApi };
        userSpotifyApi.getMyCurrentPlayingTrack()
        .then(function(data) {
        console.log(username + ' Now playing: ' + data.body.item.name);
        }, function(err) {
        console.log('Something went wrong!', err);
        });
        socket.emit("track", userSpotifyApi.getAccessToken());

}

exports.refreshToken = async function (socket, username) {
    users[username].spotifyApi.refreshAccessToken().then((data) => {
        users[username].spotifyApi.setAccessToken(data.body['access_token']);
        dbHandler.updateAccessToken(username, data.body['access_token']);
        socket.emit("track", data.body['access_token']);
    })
}

exports.disconnect = function (socket) {
    const username = Object.keys(users).find(key => users[key].socket === socket);
    if (username) {
        delete users[username];
        console.log(users)
        console.log("Connection closed")
    }
}


exports.disconnectUserWhenUrlRefreshed = function (username) {
    if (users.hasOwnProperty(username)) {
        users[username].socket.disconnect();
    }
}


