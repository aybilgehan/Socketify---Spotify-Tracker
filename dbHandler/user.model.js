const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },

    email: {
        type: String,
        require: true,
        unique: true
    },

    password: {
        type: String,
        require: true
    },

    trackID: {
        type: String
    },

    spotify: {
        email: {
            type: String
        },
        accessToken: {
            type: String
        },

        refreshToken: {
            type: String
        },

        connected: {
            type: Boolean,
            default: false
        }
    },

    spotifyAppCredential: {
        clientID: {
            type: String
        },
        clientSecret: {
            type: String
        }
    }
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;