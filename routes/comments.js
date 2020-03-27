// ***************************
// EXPRESS SETUP
// ***************************
var express          = require("express"),
    router           = express.Router({mergeParams: true}),
    Comment          = require('../models/comments'),
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

// comments are rendered directly in blog pages

//----------------------------
// .POST routes
//----------------------------

// new comment: receive and save to blog
router.post("/", isLoggedIn, (req,res) => {
    // sanitize inputs
    req.body.comment.author = req.sanitize(req.body.comment.author);
    req.body.comment.content = req.sanitize(req.body.comment.content);
        
    async function saveComment() {
        try {
            // lookup blog using ID
            let blog = await Blog.findById(req.params.id);
            // create new comment
            let comment = await Comment.create(req.body.comment);
            // connect new comment to blog
            blog.comments.push(comment);
            blog.save();
            console.log("New Comment Saved");
            // redirect    
            res.redirect("/blogs/" + blog._id);
        } catch(err) {
            console.log(err);
        }
    }
    saveComment();
});    

//----------------------------
// .PUT routes
//----------------------------

//----------------------------
// .DELETE routes
//----------------------------

// export module
module.exports = router;