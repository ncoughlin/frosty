// ***************************
// SETUP
// ***************************

console.log("app.js is connected");

// import express module
var express = require("express");
// set express to variable
var app = express();

// set listen port
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Listening on PORT: " + process.env.PORT + " at IP: " + process.env.IP);
});

// ***************************
// ROUTES
// ***************************
app.get("/", function(req, res){
    res.render("landing.ejs");
});

app.get("/preview", function(req, res){

// temporarilly placing blog posts here until database is setup

    var posts = [
            {title: "Blog Post 1", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "Blog Post 2", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "Blog Post 3", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"}
            
        ]
        
// the preview page for the blog, shows the sample blog posts    
    res.render("preview.ejs", {posts:posts});

});