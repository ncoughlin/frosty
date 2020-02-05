
// ***************************
// SETUP
// ***************************

console.log("app.js is connected");

// import express module
var express = require("express");
// set express to variable
var app = express();
// import body-parser
var bodyParser = require("body-parser");
// import mongoose
var mongoose = require("mongoose");

// set listen port
// must set listen port to 8080 for public viewing. see https://ncoughlin.com/aws-cloud9-making-express-js-server-publicly-available/
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Listening on PORT: " + process.env.PORT + " at IP: " + process.env.IP);
});


// direct express to static files like CSS and Logos
app.use(express.static("public"));
// use body-parser
app.use(bodyParser.urlencoded({extended:true}));

// ***************************
// DATABASE SETUP
// ***************************

// connecting application to mongoDB
mongoose.connect('mongodb://localhost/frosty_data', {useNewUrlParser: true, useUnifiedTopology: true});

// console logging if connection is successful
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB Connected");
});

// Mongoose Schema for Posts
var postSchema = new mongoose.Schema({
    image: String,
    title: String,
    author: String,
    date: {type: Date, default: Date.now},
    short: String,
    content: String
});

// creating schema Model named Post to be called later
// IE Post.find() or Post.create()
// Compiling the model is what allows us to run these Mongoose methods
var Post = mongoose.model("Post", postSchema);


// ***************************
// ROUTES
// ***************************

//----------------------------
// .GET routes
//----------------------------


// render the landing page
app.get("/", function(req, res){
    res.render("landing.ejs");
});

// render the posts page
app.get("/posts", function(req, res){
// get posts from database 
    Post.find({}, function(err, posts){
        if(err){
            console.log("Error: Unable to retreive post data.");
        } else {
            res.render("index.ejs", {posts:posts});
        }
    });
});


// new post page
app.get("/posts/new", function(req, res){
    res.render("newPost.ejs");
});

// render individual post. This is a wildcard link and must therefore be
// placed after static links in the application!
app.get("/posts/:id", function(req, res){
    // find post with provided ID
    Post.findById(req.params.id, function(err, dbData){
        if(err){
            console.log("error finding post data by ID");
        } else {
            // render single post template with that post data
            res.render("singlePost.ejs", {post: dbData});
        }
    });
});


//----------------------------
// .POST routes
//----------------------------

app.post("/posts", function(req, res){
    // get data from form and add to posts array
    var title = req.body.title;
    var author = req.body.author;
    var date = req.body.date;
    var content = req.body.content;
    var short = req.body.short;
    var image = req.body.image;
    
    var newPostFormData = {title: title, author: author, date: date, content: content, image: image, short: short};
    
    Post.create(newPostFormData, function(err, newDatabaseRecord){
        if(err){
            console.log("Failed to write post to database.");
        } else {
            console.log("Post successfully saved to database.");
            console.log(newDatabaseRecord);
        }
    });
    
    // redirect back to posts page
    res.redirect("/posts");
});


// ***************************
// Command Reference
// ***************************

// Start MongoDB: sudo service mongod start
// Check MongoDB Status: service mongod status (in unix shell)