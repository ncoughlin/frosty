const mongoose = require("mongoose");

// Mongoose Schema for Blogs
const blogSchema = new mongoose.Schema({
    image: String,
    title: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectID,
            ref: "User"
        },
        username: String,
        firstname: String,
        lastname: String
    },
    date: {type: Date, default: Date.now},
    short: String,
    content: String,
    comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
    ]
});

// creating schema Model named Blog to be called later
// IE Blog.find() or Blog.create()
// Compiling the model is what allows us to run these Mongoose methods
module.exports = mongoose.model("Blog", blogSchema);