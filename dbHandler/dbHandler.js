const mongoose = require('mongoose');
const userModel = require('./user.model');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
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

// Connect to MongoDB
/* exports.connect = function () {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('DB connection is set.')
    });
} */

// Create new user
exports.addUser = function (username, password, email) {
    try {
        const user = new userModel({
            username: username,
            password: password,
            email: email
        });
        user.save();
        return true;
    } catch (err) {
        console.log(err);
    }

}

// check spotify is connected   
exports.checkSpotify = function (userID) {
    return userModel.findById(userID).spotify.connected;
}

// check spotify account is allready connected before
exports.checkSpotifyAccount = async function (email) {
    return await userModel.findOne({ "spotify.email": email });
}

// connect spotify
exports.addSpotifyAccount = async function (username, email, accessToken, refreshToken) {
    try {
        await userModel.findOneAndUpdate({ username: username }, {
            trackID: uuidv4(),
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

// get access token
exports.getTokens = async function (username) {
    return new Promise((resolve) => {
        try {
            console.log(username)
            userModel.findOne({ username: username }).then((data) => {
                resolve(data.spotify);
            })
        } catch (err) {
            console.log(err);
            resolve(false);
        }
    })
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

// update settings
exports.getOption = function (username) {
    return userModel.findOne({ username: username }).settings.option;
}

exports.setOption = function (username, option) {
    userModel.findOneAndUpdate({ username: username }, {
        settings: {
            option: option
        }
    })
}

exports.getUserCredentialsForTrack = async function (trackID) {

    try {
        let user = await userModel.findOne({ trackID: trackID });
        return user.username;

    } catch (err) {
        console.log("girdi")
        console.log(err);
    }
}





