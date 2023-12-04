const Users = require("../dbHandler/user.model.js");
const querystring = require('querystring');
const axios = require('axios');
require('dotenv').config();
const SpotifyWebApi = require("../spotifyApi/spotifyHandler.js")
const { v4: uuidv4 } = require('uuid');
const dbHandler = require("../dbHandler/dbHandler.js")
const webSocket = require("../webSocket/webSocket.js")


const REDIRECT_URI = process.env.REDIRECT_URI;


exports.getLoginPage = async (req, res, next) => {
    try {
        res.status(200).render("login");
    } catch (error) {
        console.log(error);
    }
};

exports.postLoginPage = async (req, res, next) => {
    try {
        let user = await Users.findOne({ "username": req.body.username });
        if (!user || user.password != req.body.password) {
            res.send("köyüne dön");
            return;
        } else {
            req.session.user = user.username;
            req.session.connected = user.spotify.connected;
            if (user.spotify.connected) {
                req.session.trackID = user.trackID;
            }
            res.redirect("/")
        }
    } catch (error) {
        console.log(error);
    }
}


exports.getMainPage = async (req, res, next) => {
    try {
        res.status(200).render("index", {
            user: req.session.user
        })
    }
    catch (error) {
        console.log(error);
    }
}

exports.getDashboardPage = async (req, res, next) => {
    try{
        res.status(200).render("dashboard", {
            connected: req.session.connected,
            option: req.session.option,
            trackID: req.session.trackID
        })
    }catch(error){
        console.log(error);
    }
}
exports.postMainPage = async (req, res, next) => {
    try {

        let user = await Users.findOne({ "email": req.body.email });
        if (!user) {
            res.send("köyüne dön");
            return;
        }
        req.session.user = user.email;
        res.render("main", {
            user: req.session.user
        });

    } catch (error) {
        console.log(error);
    }
};

exports.getRegisterPage = async (req, res, next) => {
    try {
        res.status(200).render("register");

    } catch (error) {
        console.log(error);
    }
};
exports.postRegisterPage = async (req, res, next) => {
    console.log(req.body);
    try {

        let checkEmail = await Users.findOne({ "email": req.body.email })
        let checkUsername = await Users.findOne({ "username": req.body.username })

        if (checkEmail) {
            res.send("Emaile kayıtlı kullanıcı var");
            return;
        } else if (checkUsername) {
            res.send("Username kayıtlı kullanıcı var");
            return;
        }
        else {
            req.body.trackID = uuidv4();
            await Users.create(req.body);
            res.send("<pre>kullanici olusturuldu.</pre> <a href='/'>Anasayfaya git</a>");
        }
    } catch (error) {
        console.log(error);
    }
};

exports.getLogoutPage = async (req, res, next) => {
    try {
        req.session = null;
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
};

exports.postSpotifyCredentials = async (req, res, next) => {
    try {
        await dbHandler.addUserSpotifyCredentials(req.session.user, req.body.clientID, req.body.clientSecret);
        next();
    }catch(err){
        res.send(err);        
    }
}

exports.getAuthPage = async (req, res, next) => {
    let user = await Users.findOne({ "username": req.session.user });
    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: user.spotifyAppCredential.clientID,
        scope: 'user-read-private user-read-email user-read-currently-playing user-modify-playback-state', // Adjust scopes as needed
        redirect_uri: REDIRECT_URI,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
}

exports.getCallbackPage = async (req, res, next) => {
    let user = await Users.findOne({ "username": req.session.user });
    const code = req.query.code;

    // Exchange the code for an access token
    const tokenParams = querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: user.spotifyAppCredential.clientID,
        client_secret: user.spotifyAppCredential.clientSecret,
    });

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', tokenParams, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        SpotifyWebApi.connectSpotifyAccount(req.session.user, response.data.access_token, response.data.refresh_token).then(
            (response) => {
                if (response) {
                    req.session.connected = true;
                    res.redirect("/")
                } else {
                    res.send("Bu hesap zaten başka bir kullanıcıya bağlı")
                }
            }
        )
    } catch (error) {
        console.error(error);
        res.send('Error');
    }
}


exports.getTrackPage = async (req, res, next) => {
    try {
        let user = await Users.findOne({ trackID: req.params.trackID });

        if (!user) { res.send("Yanlış track id"); return; }
        res.render("track", { username: user.username })

    } catch (err) {
        res.send("Yanlış track id")
    }
}

exports.refreshURL = async (req, res, next) => {
    try {
        let user = await Users.findOne({ username: req.session.user });
        if (!user) { res.send("error"); return; }

        let newTrackID = uuidv4();
        user.trackID = newTrackID;
        user.save();
        webSocket.disconnectUserWhenUrlRefreshed(req.session.user);
        res.json({ trackID: newTrackID });
        
    } catch (err) {
        console.log(err);
        res.send("error")
    }
}