
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
// import method-override
var methodOverride = require("method-override");

// set listen port
// must set listen port to 8080 for public viewing. see https://ncoughlin.com/aws-cloud9-making-express-js-server-publicly-available/
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Listening on PORT: " + process.env.PORT + " at IP: " + process.env.IP);
});


// direct express to static files like CSS and Logos
app.use(express.static("public"));
// use body-parser
app.use(bodyParser.urlencoded({extended:true}));
// use method-override
app.use(methodOverride("_method"));

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
var blogSchema = new mongoose.Schema({
    image: String,
    title: String,
    author: String,
    date: {type: Date, default: Date.now},
    short: String,
    content: String
});

// creating schema Model named Blog to be called later
// IE Blog.find() or Blog.create()
// Compiling the model is what allows us to run these Mongoose methods
var Blog = mongoose.model("Blog", blogSchema);


// ***************************
// DOM Interactivity
// ***************************


// ***************************
// ROUTES
// ***************************

//----------------------------
// .GET routes
//----------------------------


// landing page
app.get("/", function(req, res){
    res.render("landing.ejs");
});

// posts index
app.get("/posts", function(req, res){
// get blogs from database 
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("Error: Unable to retreive blog data.");
        } else {
            res.render("index.ejs", {blogs:blogs});
        }
    });
});


// new post form
app.get("/posts/new", function(req, res){
    res.render("newBlog.ejs");
});

// settings/general
app.get("/settings/general", function(req, res){
    res.render("settings-general.ejs");
});

// settings>blogs
app.get("/settings/blogs", function(req, res){
// get blogs from database 
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("Error: Unable to retreive blog data.");
        } else {
            res.render("settings-blogs.ejs", {blogs:blogs});
        }
    });
});

// settings>blogs>:id>edit
app.get("/settings/blogs/:id/edit", function(req, res){
     // find post with provided ID
    Blog.findById(req.params.id, function(err, dbData){
        if(err){
            console.log("error finding blog data by ID");
        } else {
            // render single post template with that post data
            res.render("editBlog.ejs", {blog: dbData});
        }
    });
});

// render individual post. This is a wildcard link and must therefore be
// placed after static links in the application!
app.get("/posts/:id", function(req, res){
    // find post with provided ID
    Blog.findById(req.params.id, function(err, dbData){
        if(err){
            console.log("error finding blog data by ID");
        } else {
            // render single post template with that post data
            res.render("singleBlog.ejs", {blog: dbData});
        }
    });
});


//----------------------------
// .POST routes
//----------------------------

// new post
app.post("/posts", function(req, res){
    // get data from form and add to blogs array
    
    Blog.create(req.body.blog, function(err, newDatabaseRecord){
        if(err){
            console.log("Failed to write post to database.");
        } else {
            console.log("Blog successfully saved to database.");
            console.log(newDatabaseRecord);
        }
    });
    
    // redirect back to blogs page
    res.redirect("/posts");
});


//----------------------------
// .PUT routes
//----------------------------
// edit post
app.put("/settings/blogs/:id", function(req, res){
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, newDatabaseRecord){
        if(err){
            console.log("Failed to update database");
        } else {
            res.redirect("/posts/" + req.params.id);
        }
    });
}); 

// ***************************
// Command Reference
// ***************************

// Start MongoDB: sudo service mongod start
// Check MongoDB Status: service mongod status (in unix shell)