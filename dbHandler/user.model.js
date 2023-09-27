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
        option: {
            type: String,
            default: "Option 1"
        }
    }
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;