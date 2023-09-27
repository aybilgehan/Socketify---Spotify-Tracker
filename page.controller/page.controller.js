const Users = require("../dbHandler/user.model.js");
const querystring = require('querystring');
const axios = require('axios');
require('dotenv').config();
const SpotifyWebApi = require("../spotifyApi/spotifyHandler.js")

const SPOTIFY_CLIENT_ID =  process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;


exports.getLoginPage = async(req, res, next) => {
    try {
        res.status(200).render("login");    
    } catch (error) {
        console.log(error);
}};

exports.postLoginPage = async(req, res, next) => {
    try {
        let user = await Users.findOne({"username":req.body.username});
        if (!user || user.password != req.body.password) {
            res.send("köyüne dön"); 
            return;
        }else{
            req.session.user = user.username;
            req.session.connected = user.spotify.connected;
            res.redirect("/")
        }
    } catch (error) {
        console.log(error);
}}


exports.getMainPage=async(req,res,next)=>{
    try{
        res.status(200).render("main", {
            user: req.session.user,
            connected: req.session.connected
        })
    }
    catch(error){
        console.log(error);
    }
}
exports.postMainPage = async(req, res, next) => {
    try {

        let user = await Users.findOne({"email":req.body.email});
        if (!user) {
            res.send("köyüne dön"); 
            return;
        }
        req.session.user = user.email;
        res.render("index",{
            user: req.session.user
        });

    } catch (error) {
        console.log(error);
}};

exports.getRegisterPage = async(req, res, next) => {
    try {
    res.status(200).render("register");
        
    } catch (error) {
        console.log(error);
}};
exports.postRegisterPage = async(req, res, next) => {
    console.log(req.body);
    try {

        let checkEmail = await Users.findOne({"email":req.body.email})
        let checkUsername = await Users.findOne({"username":req.body.username})
        
        if (checkEmail){
            res.send("Emaile kayıtlı kullanıcı var");
            return;
        }else if (checkUsername){
            res.send("Username kayıtlı kullanıcı var");
            return;
        }
        else{
            await Users.create(req.body);
            res.send("<pre>kullanici olusturuldu.</pre> <a href='/'>Anasayfaya git</a>");
        }
    } catch (error) {
        console.log(error);
}};

exports.getLogoutPage = async(req, res, next) => {
    try {
        req.session.destroy();
        res.redirect("/login");
    } catch (error) {
        console.log(error);
}};

exports.getAuthPage = async(req, res, next) => {
    const queryParams = querystring.stringify({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
        scope: 'user-read-private user-read-email user-read-currently-playing', // Adjust scopes as needed
        redirect_uri: REDIRECT_URI,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
}

exports.getCallbackPage = async(req, res, next) => {
    const code = req.query.code;

    // Exchange the code for an access token
    const tokenParams = querystring.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: SPOTIFY_CLIENT_ID,
        client_secret: SPOTIFY_CLIENT_SECRET,
    });

    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', tokenParams, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        SpotifyWebApi.connectSpotifyAccount(req.session.user, response.data.access_token, response.data.refresh_token).then(
            (response) => {
                if (response){
                    req.session.connected = true;
                    res.redirect("/")
                }else{
                    res.send("Bu hesap zaten başka bir kullanıcıya bağlı")
                }
            }
        )
    } catch (error) {
        console.error(error);
        res.send('Error');
    }
}
