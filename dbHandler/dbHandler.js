const mongoose = require('mongoose');
const userModel = require('./user.model');
require('dotenv').config();

exports.connect = function() {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('DB connection is set.')
    });
}

exports.addUser = function(username, password) {
    const user = new userModel({
        username: username,
        password: password
    });

    user.save().then(() => {
        console.log('User is added.');
    });
}

// check spotify is connected   

// disconnect spotify 

// update settings




