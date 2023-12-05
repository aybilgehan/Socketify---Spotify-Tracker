const Users = require("../dbHandler/user.model.js");
const querystring = require('querystring');
const axios = require('axios');
require('dotenv').config();
const SpotifyWebApi = require("../spotifyApi/spotifyHandler.js")
const { v4: uuidv4 } = require('uuid');
const dbHandler = require("../dbHandler/dbHandler.js")
const webSocket = require("../webSocket/webSocket.js")


const REDIRECT_URI = process.env.REDIRECT_URI;


// Get login page
exports.getLoginPage = async (req, res, next) => {
    try {
        res.status(200).render("login");
    } catch (error) {
        console.log(error);
    }
};

// Post login page
exports.postLoginPage = async (req, res, next) => {
    try {
        let user = await Users.findOne({ "username": req.body.username });
        if (!user || user.password != req.body.password) {
            res.send("Invalid username or password");
            setTimeout(() => {
                res.redirect("/login");
            }, 2000);
        } else {
            req.session.user = user.username;
            req.session.connected = user.spotify.connected;
            res.redirect("/")
        }
    } catch (error) {
        console.log(error);
    }
}


// Get main page
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

// Get dashboard page
exports.getDashboardPage = async (req, res, next) => {
    let user = await Users.findOne({ "username": req.session.user });
    if (user.spotify.connected) {
        req.session.trackID = user.trackID;
    }
    try{
        res.status(200).render("dashboard", {
            connected: req.session.connected,
            trackID: req.session.trackID
        })
    }catch(error){
        console.log(error);
    }
}


// Get register page
exports.getRegisterPage = async (req, res, next) => {
    try {
        res.status(200).render("register");

    } catch (error) {
        console.log(error);
    }
};

// Post register page
exports.postRegisterPage = async (req, res, next) => {
    console.log(req.body);
    try {

        let checkEmail = await Users.findOne({ "email": req.body.email })
        let checkUsername = await Users.findOne({ "username": req.body.username })

        if (checkEmail) {
            res.send("Email has already been registered");
            setTimeout(() => {
                res.redirect("/register");
            }, 2000);
        } else if (checkUsername) {
            res.send("Username has already been registered");
            setTimeout(() => {
                res.redirect("/register");
            }, 2000);
        }
        else {
            req.body.trackID = uuidv4();
            await Users.create(req.body);
            res.send("<pre>User is created.</pre> <a href='/'>Homepage</a>");
        }
    } catch (error) {
        console.log(error);
    }
};

// Get logout page
exports.getLogoutPage = async (req, res, next) => {
    try {
        req.session = null;
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
};

// Post spotify credentials
exports.postSpotifyCredentials = async (req, res, next) => {
    try {
        await dbHandler.addUserSpotifyCredentials(req.session.user, req.body.clientID, req.body.clientSecret);
        next();
    }catch(err){
        res.send(err);        
    }
}

// Get auth page
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

// Get callback page
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
                    res.send("The account is already connected")
                }
            }
        )
    } catch (error) {
        console.error(error);
        res.send('Error');
    }
}


// Get track page
exports.getTrackPage = async (req, res, next) => {
    try {
        let user = await Users.findOne({ trackID: req.params.trackID });

        if (!user.spotify.connected) { res.send("Spotify has not connected"); return; }
        res.render("track", { username: user.username })

    } catch (err) {
        res.send("Invalid track id")
    }
}

// Refresh track url
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