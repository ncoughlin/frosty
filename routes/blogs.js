// ***************************
// EXPRESS SETUP
// ***************************
var express          = require("express"),
    router           = express.Router({mergeParams: true}),
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

// landing page is in index.js

// blogs index
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

// new post form
router.get("/new", isLoggedIn, (req, res) => {
    res.render("newBlog.ejs");
});

// edit post form
router.get("/:id/edit", isLoggedIn, (req, res) => {
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

// render individual post. This is a wildcard link and must therefore be
// placed after static links in the application!
router.get("/:id",(req, res) => {
    // Find Blog by ID and populate comments
    Blog.findById(req.params.id).
    // populate comments
    populate("comments").
    exec((err, dbData) => {
        if(err){
            console.log("error finding blog data by ID");
        } else {
            // render single post template with that post data
            res.render("singleBlog.ejs", {blog: dbData});
            console.log("Article: " + dbData.title + " has loaded.");
        }
    });
});

//----------------------------
// .POST routes
//----------------------------

// new blog: receive and save
router.post("/", isLoggedIn, (req, res) => {
    // sanitize inputs
    req.body.blog.title = req.sanitize(req.body.blog.title);
    req.body.blog.short = req.sanitize(req.body.blog.short);
    req.body.blog.content = req.sanitize(req.body.blog.content);
    // get data from form and add to blogs array
    Blog.create(req.body.blog,(err, newDatabaseRecord) => {
        if(err){
            console.log("Failed to write post to database.");
        } else {
            console.log("Blog successfully saved to database.");
            console.log(newDatabaseRecord);
            // redirect back to blogs page
             res.redirect("/");
        }
    });
});

//----------------------------
// .PUT routes
//----------------------------

// edit post
router.put("/:id",(req, res) => {
    // sanitize inputs
    req.body.blog.title = req.sanitize(req.body.blog.title);
    req.body.blog.short = req.sanitize(req.body.blog.short);
    req.body.blog.content = req.sanitize(req.body.blog.content);
    // find and update post
    Blog.findByIdAndUpdate(req.params.id, req.body.blog,(err, oldDatabaseRecord) => {
        if(err){
            console.log("Failed to update database");
        } else {
            console.log("Blog successfully updated in database.");
            // we want to log the UPDATED data, not the old
            Blog.findById(req.params.id, '_id image title author date short content' , { lean: true },(err, newDatabaseRecord) => {
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
router.delete("/:id",(req, res) => {
    Blog.findByIdAndRemove(req.params.id,(err) => {
        if(err){
          console.log("failed to delete Mongo document");  
        } else {
            console.log("Blog with ID:" + req.params.id + " has been deleted");
            res.redirect("/settings/blogs");
        }
    });
})


// export module
module.exports = router;