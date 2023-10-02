const SpotifyWebApi = require('spotify-web-api-node');
const dbHandler = require('../dbHandler/dbHandler');
const userModel = require('../dbHandler/user.model');

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
});

exports.connectSpotify = function (username) {
    return new Promise((resolve, reject) => {
        const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
        const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
        const REDIRECT_URI = process.env.REDIRECT_URI;
        try {
            const spotifyApi = new SpotifyWebApi({
                clientId: SPOTIFY_CLIENT_ID,
                clientSecret: SPOTIFY_CLIENT_SECRET,
                redirectUri: REDIRECT_URI,
            });

            dbHandler.getTokens(username).then((data) => {
                spotifyApi.setAccessToken(data.accessToken);
                spotifyApi.setRefreshToken(data.refreshToken);
            }).then(() => {
                resolve(spotifyApi);
            })
        } catch (err) {
            console.log(err);
            resolve(false);
        }
    })
}

/*exports.setInitalTokens = function(userSpotifyApi, username) {
    console.log("username" + username)
    dbHandler.getTokens(username).then((data) => {
        console.log("db den gelen tokenlar" + data)
        userSpotifyApi.setAccessToken(data.accessToken);
        userSpotifyApi.setRefreshToken(data.refreshToken);
        console.log("değişmesi gerekenler" + userSpotifyApi.getCredentials())
    })
}
*/
exports.setInitalTokens = function (userSpotifyApi, username) {
    dbHandler.getTokens(username).then((data) => {
        userSpotifyApi.setAccessToken(data.accessToken);
        userSpotifyApi.setRefreshToken(data.refreshToken);
    })
}

exports.refreshToken = function (userSpotifyApi, username) {
    userSpotifyApi.refreshAccessToken().then((data) => {
        userSpotifyApi.setAccessToken(data.body['access_token']);
        dbHandler.updateAccessToken(username, data.body['access_token']);
        return data.body['access_token'];
    })
}

// Gerekli fonksiyonlara access token aktiflik kontrolü

// Saniyede istek atıp karşılaştırma
exports.checkPlaying = function (ws, userSpotifyApi, username) {
    api = userSpotifyApi;
    let isPlaying = false;
    let music = "";

    setInterval(() => {
        api.getMyCurrentPlayingTrack().then((data) => {
            if (data.statusCode == 200) {
                if (data.body.item.name != music || data.body.is_playing != isPlaying) {
                    isPlaying = data.body.is_playing;
                    music = data.body.item.name;
                    ws.emit("track", JSON.stringify(
                        {
                            "name": data.body.item.name,
                            "artist": data.body.item.artists[0].name,
                            "image": data.body.item.album.images[0].url,
                            "isPlaying": data.body.is_playing
                        })
                    )
                }
            }
        })
            .catch((err) => {
                console.log("buraya girdi")
                console.log(err);
                api.refreshAccessToken().then((data) => {
                    api.setAccessToken(data.body['access_token']);
                    dbHandler.updateAccessToken(username, data.body['access_token']);
                })
            })

    }, 1000)
}


// DB ye kayıt edilirken aynı spotify hesabın başka kişiye kayıtlı olup olmadığının kontrolü
exports.connectSpotifyAccount = function (username, accessToken, refreshToken) {
    return new Promise((resolve, reject) => {
        try {
            spotifyApi.setAccessToken(accessToken);

            spotifyApi.getMe().then(function (data) {
                dbHandler.checkSpotifyAccount(data.body.email).then(async (dbdata) => {
                    if (!dbdata) {
                        await dbHandler.addSpotifyAccount(username, data.body.email, accessToken, refreshToken);
                        resolve(true);
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

// Spotify auth edilme kısmı
exports.spotifyAuth = function (spotifyApi) {
    const scopes = ['user-read-private', 'user-read-email', 'user-read-playback-state', 'user-modify-playback-state'];
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    return authorizeURL;
}
