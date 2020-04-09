// ***************************
// EXPRESS SETUP
// ***************************
const express          = require('express'),
      router           = express.Router({mergeParams: true}),
      Blog             = require('../models/blogs'),
      User             = require('../models/users');
    
// ***************************
// MIDDLEWARE FUNCTIONS
// ***************************

// check if user is logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

// pass through user data on every route
router.use((req,res,next) => {
    res.locals.currentUser = req.user;
    next();
});        

// ***************************
// ROUTES
// ***************************

//----------------------------
// .GET routes
//----------------------------

// settings/dashboard
router.get("/dashboard", isLoggedIn, (req, res) => {
    res.render("settings-dashboard.ejs");
});

// settings/users
router.get("/users", isLoggedIn, (req, res) => {
    // get users from database
    User.find({},(err, users) => {
        if(err){
            console.log("Error: Unable to retrieve user data");
        } else {
            res.render("settings-users.ejs", {users:users});
        }
    })
});

// settings/general
router.get("/general", isLoggedIn, (req, res) => {
    res.render("settings-general.ejs");
});

// settings/blogs
router.get("/blogs", isLoggedIn, (req, res) => {
    // get blogs from database 
    Blog.find({},(err, blogs) => {
        if(err){
            console.log("Error: Unable to retrieve blog data.");
        } else {
            res.render("settings-blogs.ejs", {blogs:blogs});
        }
    });
});

// settings/comments
router.get("/comments", isLoggedIn, (req, res) => {
    res.render("settings-comments.ejs");
});


//----------------------------
// .POST routes
//----------------------------

//----------------------------
// .PUT routes
//----------------------------

//----------------------------
// .DELETE routes
//----------------------------


// export module
module.exports = router;