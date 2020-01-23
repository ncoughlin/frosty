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
    res.send("Welcome to the Home Page");
});