const mongoose = require("mongoose");

// Mongoose Schema for comments
const commentSchema = new mongoose.Schema({
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectID,
            ref: "User"
        },
        username: String,
        role: String,
        image: String
    },
    date: {type: Date, default: Date.now},
    content: String,
    // References to blog where submitted
    blogID: String,
    blogTitle: String,
});

// creating schema Model named Blog to be called later
// IE Blog.find() or Blog.create()
// Compiling the model is what allows us to run these Mongoose methods
module.exports = mongoose.model("Comment", commentSchema);