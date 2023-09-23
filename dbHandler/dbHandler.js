const mongoose = require('mongoose');
const userModel = require('./user.model');
require('dotenv').config();

// Connect to MongoDB
exports.connect = function() {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('DB connection is set.')
    });
}

// Create new user
exports.addUser = function(username, password, email) {
    if(!userModel.findOne({username: username}) && !userModel.findOne({email: email})) {
        const user = new userModel({
            username: username,
            password: password,
            email: email
        });
        user.save();
        return true;
    } else {
        return false;
    }
}

// check spotify is connected   
exports.checkSpotify = function(userID) {
    return userModel.findById(userID).spotify.connected;
}

// check spotify account is allready connected before
exports.checkSpotifyAccount = function(email) {
    return userModel.findOne({"spotify.email": email});
}

// connect spotify
exports.addSpotifyAccount = function(userID, email, accessToken, refreshToken) {
    try{
        userModel.findByIdAndUpdate(userID, {
            spotify: {
                email: email,
                accessToken: accessToken,
                refreshToken: refreshToken,
                connected: true
            }
        })
        return true;
    }catch(err){
        console.log(err);
        return false;
    }
}

// delete spotify
exports.deleteSpotifyAccount = function(userID) {
    try{
        userModel.findByIdAndUpdate(userID, {
            spotify: {
                email: "",
                accessToken: "",
                refreshToken: "",
                connected: false
            }
        })
        return true;
    }catch (err){
        console.log(err);
        return false;
    }
}

// get access token
exports.getTokens = function(userID) {
    return userModel.findById(userID).spotify;
}

// update access token
exports.updateAccessToken = function(userID, accessToken) {
    try{
        userModel.findByIdAndUpdate(userID, {
            spotify: {
                accessToken: accessToken
            }
        })
        return true;
    }catch (err){
        console.log(err);
        return false;
    }
}

// update settings




