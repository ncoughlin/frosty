const mongoose = require("mongoose");

// Mongoose Schema for comments
const commentSchema = new mongoose.Schema({
    author: String,
    date: {type: Date, default: Date.now},
    content: String
});

// creating schema Model named Blog to be called later
// IE Blog.find() or Blog.create()
// Compiling the model is what allows us to run these Mongoose methods
module.exports = mongoose.model("Comment", commentSchema);