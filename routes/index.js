// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
      passport         = require('passport'),
      User             = require('../models/users'),
      Blog             = require('../models/blogs');
    
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

// landing page
router.get("/",(req, res) => {
    // get blogs from database 
    Blog.find({},(err, blogs) => {
        if(err){
            console.log("Error: Unable to retreive blog data.");
        } else {
            res.render("index.ejs", {blogs:blogs});
        }
    });
});

// login page
router.get("/login",(req, res) => {
    res.render("login.ejs");
});

// register page
router.get("/register",(req, res) => {
    res.render("register.ejs");
});

// logout user
router.get("/logout",(req, res) => {
    req.logout();
    res.redirect("/");
});

//----------------------------
// .POST routes
//----------------------------

// new user registration: save user to database and authenticate them
router.post("/register", (req, res) => {
  var newUser = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    username: req.body.username
  });
  User.register(newUser, req.body.password, (err, user) => {
    console.log("attempting user registration");
    if (err) {
      console.log(err);
      return res.render("register.ejs");
    }
    passport.authenticate("local")(req, res, () => {
      res.redirect("/");
    });
    console.log("user registration successful: " + newUser.username);
  });
});

// login user: authenticate user
// app.post("/login", middleware, callback)
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/settings/dashboard",
    failureRedirect: "/login"
  }),
  (req, res) => {}
);

//----------------------------
// .PUT routes
//----------------------------

//----------------------------
// .DELETE routes
//----------------------------



// export module
module.exports = router;