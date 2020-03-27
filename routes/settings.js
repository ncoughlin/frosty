var express          = require("express"),
    router           = express.Router(),
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

// settings/dashboard
router.get("/settings/dashboard", isLoggedIn, (req, res) => {
    res.render("settings-dashboard.ejs");
});

// settings/blogs
router.get("/settings/blogs", isLoggedIn, (req, res) => {
// get blogs from database 
    Blog.find({},(err, blogs) => {
        if(err){
            console.log("Error: Unable to retreive blog data.");
        } else {
            res.render("settings-blogs.ejs", {blogs:blogs});
        }
    });
});

// settings/users
router.get("/settings/users", isLoggedIn, (req, res) => {
    res.render("settings-users.ejs");
});

// settings/general
router.get("/settings/general", isLoggedIn, (req, res) => {
    res.render("settings-general.ejs");
});

// settings>blogs>:id>edit
router.get("/settings/blogs/:id/edit", isLoggedIn, (req, res) => {
     // find post with provided ID
    Blog.findById(req.params.id,(err, dbData) => {
        if(err){
            console.log("error finding blog data by ID");
        } else {
            // render single post template with that post data
            res.render("editBlog.ejs", {blog: dbData});
        }
    });
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