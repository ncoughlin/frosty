const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// Mongoose Schema for comments
const userSchema = new mongoose.Schema({
    username: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// creating schema Model named Blog to be called later
// IE Blog.find() or Blog.create()
// Compiling the model is what allows us to run these Mongoose methods
module.exports = mongoose.model("User", userSchema);