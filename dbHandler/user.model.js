const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },

    email: {
        type:String,
        require: true,
        unique: true
    },

    password: {
        type:String,
        require: true
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

    settings: {
        style: {
            type: String,
            default: "spotify"
        },
        backgroundColor: {
            type: String,
            default: "#000000"
        },
        textColor: {
            type: String,
            default: "#ffffff"
        }
    }
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;