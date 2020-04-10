// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
      middleware       = require('../middleware'),
      Blog             = require('../models/blogs');
      
    
// ***************************
// GLOBAL VARIABLES
// ***************************

// pass through user data on every route
router.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
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
            req.flash('error', 'Unable to retreive blog data.');
            res.redirect('/');
            // redirect does not end statement like res.render
            // so we must return to end process
            return;
        } else {
            res.render("index.ejs", {blogs:blogs});
        }
    });
});

// new blog form
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("newBlog.ejs");
});


// edit blog form
router.get("/:id/edit",middleware.isLoggedIn, (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            console.log(err);
            req.flash('error', 'Unable to edit blog.');
            res.redirect('back');
            // redirect does not end statement like res.render
            // so we must return to end process
            return;
        } else {
            res.render("editBlog.ejs", {blog: foundBlog});     
        }
    });
});
           

// render individual blog. This is a wildcard link and must therefore be
// placed after static links in the application!
router.get("/:id",(req, res) => {
    
    // evaluate if the user should be able to edit
    function editorCheck(){
        return new Promise((resolve, reject)=>{
            // First check if user is logged in
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
    async function loadSingleBlogWithPermissionCheck(){
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
                    req.flash('error', 'error finding blog data by ID');
                    res.redirect('/');
                    // redirect does not end statement like res.render
                    // so we must return to end process
                    return;
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
    loadSingleBlogWithPermissionCheck();
});

//----------------------------
// .POST routes
//----------------------------

// new blog: receive and save
router.post("/", middleware.isLoggedIn, (req, res) => {
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
            req.flash('success', 'New blog saved to database.');
            // redirect back to blogs page
             res.redirect("/");
        }
    });
});

//----------------------------
// .PUT routes
//----------------------------

// edit blog
router.put("/:id",middleware.isLoggedIn,(req, res) => {
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
            req.flash('success', 'Blog updated.');
            // redirect to updated single post page
            res.redirect("/blogs/" + req.params.id);
        }
    });
    
}); 


//----------------------------
// .DELETE routes
//----------------------------

// delete post
router.delete("/:id",middleware.isLoggedIn,(req, res) => {
    Blog.findByIdAndRemove(req.params.id,(err) => {
        if(err){
          console.log("failed to .findByIdAndRemove Blog object");  
        } else {
            console.log("Blog with ID:" + req.params.id + " has been deleted");
            req.flash('success', 'Blog has been deleted.');
            res.redirect("back");
        }
    });
});


// export module
module.exports = router;