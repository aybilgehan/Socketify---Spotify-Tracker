const SpotifyWebApi = require('spotify-web-api-node');
const dbHandler = require('../dbHandler/dbHandler');
const userModel = require('../dbHandler/user.model');

const SPOTIFY_CLIENT_ID =  process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const spotifyApi = new SpotifyWebApi({ 
        clientId: SPOTIFY_CLIENT_ID,
        clientSecret: SPOTIFY_CLIENT_SECRET,
        redirectUri: REDIRECT_URI,
});


exports.setInitalTokens = function(spotifyApi, userID) {
    dbHandler.getTokens(userID).then((data) => {
        spotifyApi.setAccessToken(data.accessToken);
        spotifyApi.setRefreshToken(data.refreshToken);
    })
}

exports.refreshToken = function(spotifyApi, userID) {
    spotifyApi.refreshAccessToken().then((data) => {
        spotifyApi.setAccessToken(data.body['access_token']);
        dbHandler.updateAccessToken(userID, data.body['access_token']);
    })
}

// Gerekli fonksiyonlara access token aktiflik kontrolü 

// Saniyede istek atıp karşılaştırma

// DB ye kayıt edilirken aynı spotify hesabın başka kişiye kayıtlı olup olmadığının kontrolü
exports.connectSpotifyAccount = function(username, accessToken, refreshToken) {
    return new Promise((resolve, reject) => {
        try{
            spotifyApi.setAccessToken(accessToken);

            spotifyApi.getMe().then(function(data) {
                dbHandler.checkSpotifyAccount(data.body.email).then(async (dbdata) => {
                    if(!dbdata){
                        await dbHandler.addSpotifyAccount(username, data.body.email, accessToken, refreshToken);
                        resolve(true);
                    }else{
                        resolve(false);
                    }
                })
            })
        }catch(err){
            console.log(err);
            resolve(false);
        }
    })
}

// Spotify auth edilme kısmı
exports.spotifyAuth = function(spotifyApi) {
    const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state'];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    return authorizeURL;
}
