const mongoose = require('mongoose');
const userModel = require('./user.model');
require('dotenv').config();
const { exit } = require('process');


exports.connect = async function () {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('DB connection is set.')
    }).catch((error) => {
        console.log(error);
        exit(console.log("DB connection is not set."));
    });
} 


// check spotify account is allready connected before
exports.checkSpotifyAccount = async function (email) {
    return await userModel.findOne({ "spotify.email": email });
}

exports.addUserSpotifyCredentials = async function (username, clientID, clientSecret) {
    try {
        await userModel.findOneAndUpdate({ username: username }, {
            spotifyAppCredential: {
                clientID: clientID,
                clientSecret: clientSecret
            }
        })
        return true;
    }catch(err){
        return err;
    }
}

// connect spotify
exports.addSpotifyAccount = async function (username, email, accessToken, refreshToken) {
    try {
        await userModel.findOneAndUpdate({ username: username }, {
            spotify: {
                email: email,
                accessToken: accessToken,
                refreshToken: refreshToken,
                connected: true
            }
        })
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}

// delete spotify
exports.deleteSpotifyAccount = function (userID) {
    try {
        userModel.findByIdAndUpdate(userID, {
            spotify: {
                email: "",
                accessToken: "",
                refreshToken: "",
                connected: false
            }
        })
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}


// update access token
exports.updateAccessToken = async function (username, accessToken) {
    try {
        await userModel.findOne({ username: username }).then((data) => {
            data.spotify.accessToken = accessToken;
            data.save();
        })
    } catch (err) {
        console.log(err);
    }
}






