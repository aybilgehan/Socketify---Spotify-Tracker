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

exports.connectSpotify = function(){
    const SPOTIFY_CLIENT_ID =  process.env.SPOTIFY_CLIENT_ID;
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;

    const spotifyApi = new SpotifyWebApi({ 
            clientId: SPOTIFY_CLIENT_ID,
            clientSecret: SPOTIFY_CLIENT_SECRET,
            redirectUri: REDIRECT_URI,
    });
    return spotifyApi;
}


exports.setInitalTokens = function(userSpotifyApi, username) {
    dbHandler.getTokens(username).then((data) => {
        userSpotifyApi.setAccessToken(data.accessToken);
        userSpotifyApi.setRefreshToken(data.refreshToken);
    })
}

exports.refreshToken = function(userSpotifyApi, username) {
    console.log("geldi")
    userSpotifyApi.refreshAccessToken().then((data) => {
        userSpotifyApi.setAccessToken(data.body['access_token']);
        dbHandler.updateAccessToken(username, data.body['access_token']);
        return data.body['access_token'];
    })
}

// Gerekli fonksiyonlara access token aktiflik kontrolü

// Saniyede istek atıp karşılaştırma
exports.checkPlaying = function(userSpotifyApi, username) {
        return new Promise((resolve) => {
        let isPlaying = false;
        let music = "";
        console.log(userSpotifyApi)

            setInterval(() => {
                userSpotifyApi.getMyCurrentPlayingTrack().then((data) => {

                        if(data.body.item.name != music || data.body.is_playing != isPlaying) {
                            resolve(JSON.stringify(
                                {
                                    "name": data.body.item.name,
                                    "artist": data.body.item.artists[0].name,
                                    "image": data.body.item.album.images[0].url,
                                    "isPlaying": data.body.is_playing
                                })
                            )
                        }
                    })
                    .catch(() => {
                        console.log("refreshing token")
                        
                        userSpotifyApi.refreshAccessToken().then((data) => {
                            userSpotifyApi.setAccessToken(data.body['access_token']);
                            dbHandler.updateAccessToken(username, data.body['access_token']);
                        })
                    })
                
            }, 1000)
    })
}


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
