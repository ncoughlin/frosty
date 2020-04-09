// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
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


// check if blog author id matches user id
function checkBlogOwnership(req,res,next){
    // check if user is logged in
    if(req.isAuthenticated()){
        // find blog
        Blog.findById(req.params.id, function(err, foundBlog){
            if(err){
                res.send("Could Not Find Blog by ID");
            } else {
                // check for matching id
                if(foundBlog.author.id.equals(req.user._id)) {
                    next();
                } else {
                    res.send("You do not have permission to do that.");
                }
            }
        });
    }
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

// new blog form
router.get("/new", isLoggedIn, (req, res) => {
    res.render("newBlog.ejs");
});


// edit blog form
router.get("/:id/edit",isLoggedIn, (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            console.log(err);
        } else {
            res.render("editBlog.ejs", {blog: foundBlog});     
        }
    });
});
           

// render individual blog. This is a wildcard link and must therefore be
// placed after static links in the application!
router.get("/:id",(req, res) => {
    
    
    // First check if user is logged in
    // If not then editorCheck is False
    function editorCheck(){
        return new Promise((resolve, reject)=>{
            if(!req.isAuthenticated()){
                resolve(false);
            // If user role = Editor || Admin
            //  let editAllow = true;    
            } else if (req.user.role === "Administrator" || req.user.role === "Editor"){
                resolve(true);
            //  if the user is any other role    
            } else {
                resolve(false);
            }
        });
    }    
    
    // check if user has blanket permission to edit a comment before loading page.
    async function checkForEditOrAdmin(){
        try {
            const editPermission = await editorCheck();
            console.log("User is Admin or Editor: " + editPermission);
            // Find Blog by ID and populate comments
            Blog.findById(req.params.id).
            // populate comments
            populate("comments").
            exec((err, dbData) => {
                if(err){
                    console.log("error finding blog data by ID");
                } else {
                    // render single post template with that post data
                    res.render("singleBlog.ejs", {blog: dbData, editPermission: editPermission});
                    console.log("Article: " + dbData.title + " has loaded.");
                }
            });
        } catch(err) {
            console.log(err);
        }
    }
    checkForEditOrAdmin();
});

//----------------------------
// .POST routes
//----------------------------

// new blog: receive and save
router.post("/", isLoggedIn, (req, res) => {
    // sanitize inputs
    req.body.blog.title   = req.sanitize(req.body.blog.title);
    req.body.blog.short   = req.sanitize(req.body.blog.short);
    req.body.blog.content = req.sanitize(req.body.blog.content);
    
    // assign variables to incoming data
    let title   = req.body.blog.title,
        image   = req.body.blog.image,
        short   = req.body.blog.short,
        content = req.body.blog.content,
        date    = req.body.blog.date;
    
    // retriever user data
    let author = {
        id: req.user._id,
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname
    };
    
    // combine all data into new variable
    let newBlog = {title: title, image: image, short: short, content: content, date: date, author: author};
    
    // save combined data to new blog
    Blog.create(newBlog,(err, newDatabaseRecord) => {
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

// edit blog
router.put("/:id",isLoggedIn,(req, res) => {
    // sanitize inputs
    req.body.blog.title = req.sanitize(req.body.blog.title);
    req.body.blog.short = req.sanitize(req.body.blog.short);
    req.body.blog.content = req.sanitize(req.body.blog.content);
    // find and update blog
    Blog.findByIdAndUpdate(req.params.id, req.body.blog,(err, oldBlog) => {
        if(err){
            console.log("Failed to update database");
        } else {
            console.log("Blog successfully updated in database.");
            // redirect to updated single post page
            res.redirect("/blogs/" + req.params.id);
        }
    });
    
}); 


//----------------------------
// .DELETE routes
//----------------------------

// delete post
router.delete("/:id",isLoggedIn,(req, res) => {
    Blog.findByIdAndRemove(req.params.id,(err) => {
        if(err){
          console.log("failed to .findByIdAndRemove Blog object");  
        } else {
            console.log("Blog with ID:" + req.params.id + " has been deleted");
            res.redirect("/settings/blogs");
        }
    });
});


// export module
module.exports = router;