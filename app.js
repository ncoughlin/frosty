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

// connecting application to mongoDB
mongoose.connect('mongodb://localhost/frosty_posts', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect('mongodb://localhost/frosty_settings', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect('mongodb://localhost/frosty_users', {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB Connected");
});

// ***************************
// Temporary Array
// ***************************
var posts = [
            {title: "Widgets and You", author: "Davie Crocket", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "How to Train Your Cat", author: "Janet Myrtleton", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "Don't Put That There", author: "Barack Obama", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "Amateur Chainsaw Juggling", author: "Indiana Jones", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "The Legend of the BeeGees", author: "Miles Davis", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"}
        ];
        
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

// render the preview page
app.get("/posts", function(req, res){
// the posts page for the blog, shows the sample blog posts    
    res.render("posts.ejs", {posts:posts});
});

// new post page
app.get("/posts/new", function(req, res){
    res.render("newPost.ejs");
});


//----------------------------
// .POST routes
//----------------------------

app.post("/posts", function(req, res){
    // get data from form and add to posts array
    var title = req.body.title;
    var author = req.body.author;
    var content = req.body.content;
    var image = req.body.image;
    
    var newPost = {title: title, author: author, content: content, image: image};
    posts.push(newPost);
    // redirect back to posts page
    res.redirect("/posts");
});