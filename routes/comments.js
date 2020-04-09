// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
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

// comments are rendered directly in blog pages with
// partials/comments using blog.comments.forEach((comment)

// edit comment form
// /blogs/:id/comments/...
router.get("/:comment_id/edit",isLoggedIn, (req, res) => {
    Comment.findById(req.params.comment_id, (err,foundComment)=>{
        if(err){
            console.log(err);
        } else {
            res.render('editComment.ejs', {blog_id: req.params.id, comment: foundComment});
        }
    });
});

//----------------------------
// .POST routes
//----------------------------

// /blogs/:id/comments - new comment: receive and save to blog
router.post("/", isLoggedIn, (req,res) => {
    // sanitize inputs
    req.body.comment.content = req.sanitize(req.body.comment.content);
        
    async function saveComment() {
        try {
            // lookup blog using ID
            let blog = await Blog.findById(req.params.id);
            // create new comment
            let comment = await Comment.create(req.body.comment);
            // add author references
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            // add blog references
            comment.blogID = blog._id;
            comment.blogTitle = blog.title;
            // save comment
            comment.save();
            // connect new comment to blog
            blog.comments.push(comment);
            blog.save();
            console.log("New Comment: " + comment);
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

// save updated comment
router.put('/:comment_id', isLoggedIn, (req,res)=>{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
        if(err){
            console.log(err);
            res.redirect('back');
        } else {
            res.redirect('/blogs/' + req.params.id);
        }
    });
});

//----------------------------
// .DELETE routes
//----------------------------

// delete comments
router.delete("/:comment_id",isLoggedIn,(req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id,(err) => {
        if(err){
          console.log("failed to .findByIdAndRemove Comment object");  
        } else {
            console.log("Comment with ID:" + req.params.comment_id + " has been deleted");
            res.redirect('/blogs/' + req.params.id);
        }
    });
});

// export module
module.exports = router;