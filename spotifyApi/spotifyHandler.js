const SpotifyWebApi = require('spotify-web-api-node');
const dbHandler = require('../dbHandler/dbHandler');
const userModel = require('../dbHandler/user.model');

const REDIRECT_URI = process.env.REDIRECT_URI;


exports.connectSpotify = async function (username) {
    var user = await userModel.findOne({ username: username });
    return new Promise((resolve, reject) => {
        try {
            var spotifyApi = new SpotifyWebApi({
                clientId: user.spotifyAppCredential.clientID,
                clientSecret: user.spotifyAppCredential.clientSecret,
                redirectUri: REDIRECT_URI,
            });

            if (user.spotify.connected) {
                spotifyApi.setAccessToken(user.spotify.accessToken);
                spotifyApi.setRefreshToken(user.spotify.refreshToken);
                resolve(spotifyApi);
            } else {
                resolve(false)
            }
        } catch (err) {
            console.log(err);
            resolve(false);
        }
    })
}


// DB ye kayıt edilirken aynı spotify hesabın başka kişiye kayıtlı olup olmadığının kontrolü
exports.connectSpotifyAccount = async function (username, accessToken, refreshToken) {
    var user = await userModel.findOne({ username: username });
    var spotifyApi = new SpotifyWebApi({
        clientId: user.spotifyAppCredential.clientID,
        clientSecret: user.spotifyAppCredential.clientSecret,
        redirectUri: REDIRECT_URI,
    });
    return new Promise((resolve, reject) => {
        try {
            spotifyApi.setAccessToken(accessToken);
            spotifyApi.getMe().then(function (data) {
                dbHandler.checkSpotifyAccount(data.body.email).then(async (dbdata) => {
                    if (!dbdata) {
                        resolve(await dbHandler.addSpotifyAccount(username, data.body.email, accessToken, refreshToken));                       
                    } else {
                        resolve(false);
                    }
                })
            })
        } catch (err) {
            console.log(err);
            resolve(false);
        }
    })
}



