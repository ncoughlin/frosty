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

// direct express to static files like CSS and Logos
app.use(express.static("public"));

// ***************************
// ROUTES
// ***************************
app.get("/", function(req, res){
    res.render("landing.ejs");
});

app.get("/preview", function(req, res){

// temporarilly placing blog posts here until database is setup

    var posts = [
            {title: "Widgets and You", author: "Davie Crocket", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "How to Train Your Cat", author: "Janet Myrtleton", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "Don't Put That There", author: "Barack Obama", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "Amateur Chainsaw Juggling", author: "Indiana Jones", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"},
            {title: "The Legend of the BeeGees", author: "Miles Davis", image: "https://ncoughlin.com/wp-content/uploads/2020/01/sample-image.jpg"}
            
        ]
        
// the preview page for the blog, shows the sample blog posts    
    res.render("preview.ejs", {posts:posts});

});