
// ***************************
// EXPRESS SETUP
// ***************************

console.log("app.js is connected");

// import express module
const express = require("express");
// set express to variable
const app = express();
// import body-parser
const bodyParser = require("body-parser");
// import mongoose
const mongoose = require("mongoose");
// import method-override
const methodOverride = require("method-override");
// import express-sanitizer
const expressSanitizer = require('express-sanitizer');

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
// use express-sanitizer
app.use(expressSanitizer());

// ***************************
// MONGO DATABASE SETUP
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
app.get("/blogs", function(req, res){
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
app.get("/blogs/new", function(req, res){
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
app.get("/blogs/:id", function(req, res){
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
app.post("/blogs", function(req, res){
    // sanitize inputs
    req.body.blog.title = req.sanitize(req.body.blog.title);
    req.body.blog.short = req.sanitize(req.body.blog.short);
    req.body.blog.content = req.sanitize(req.body.blog.content);
    // get data from form and add to blogs array
    Blog.create(req.body.blog, function(err, newDatabaseRecord){
        if(err){
            console.log("Failed to write post to database.");
        } else {
            console.log("Blog successfully saved to database.");
            console.log(newDatabaseRecord);
            // redirect back to blogs page
             res.redirect("/blogs");
        }
    });
});


//----------------------------
// .PUT routes
//----------------------------
// edit post
app.put("/blogs/:id", function(req, res){
    // sanitize inputs
    req.body.blog.title = req.sanitize(req.body.blog.title);
    req.body.blog.short = req.sanitize(req.body.blog.short);
    req.body.blog.content = req.sanitize(req.body.blog.content);
    // find and update post
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, oldDatabaseRecord){
        if(err){
            console.log("Failed to update database");
        } else {
            console.log("Blog successfully updated in database.");
            // we want to log the UPDATED data, not the old
            Blog.findById(req.params.id, '_id image title author date short content' , { lean: true }, function (err, newDatabaseRecord){
                if(err){
                    console.log("Failed To Retreive Updated Record For Display");
                } else {
                    console.log(newDatabaseRecord);
                }
            });
            // redirect to updated single post page
            res.redirect("/blogs/" + req.params.id);
        }
    });
}); 

//----------------------------
// .DELETE routes
//----------------------------
// delete post
app.delete("/blogs/:id", function(req, res){
    Blog.findByIdAndRemove(req.params.id, function (err){
        if(err){
          console.log("failed to delete Mongo document");  
        } else {
            console.log("Blog with ID:" + req.params.id + " has been deleted");
            res.redirect("/settings/blogs");
        }
    });
})

// ***************************
// Command Reference
// ***************************

// Start MongoDB: sudo service mongod start
// Check MongoDB Status: service mongod status (in linux shell)