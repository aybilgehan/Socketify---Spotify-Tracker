const SpotifyWebApi = require('spotify-web-api-node');
const dbHandler = require('../dbHandler/dbHandler');

const SPOTIFY_CLIENT_ID =  process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

exports.connectSpotify = function() {
    const spotifyApi = new SpotifyWebApi({ 
        clientId: SPOTIFY_CLIENT_ID,
        clientSecret: SPOTIFY_CLIENT_SECRET,
        redirectUri: REDIRECT_URI,
    });

    return spotifyApi;
}

exports.setAccessToken = function(userID, spotifyApi) {
    dbHandler.getAccessToken(userID).then((data) => {
        spotifyApi.setAccessToken(data);
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

// Spotify auth edilme kısmı


