// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
      middleware       = require('../middleware'),
      moment           = require('moment'),
      Comment          = require('../models/comments'),
      Blog             = require('../models/blogs');
    
// ***************************
// PASSPORT
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

// comments are rendered directly in blog pages with
// partials/comments using blog.comments.forEach((comment)

// edit comment form
// /blogs/:id/comments/...
router.get("/:comment_id/edit",middleware.isLoggedIn, (req, res) => {
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
router.post("/", middleware.isLoggedIn, (req,res) => {
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
            req.flash('success', 'Comment Saved.');
            res.redirect('back');
        } catch(err) {
            console.log(err);
            req.flash('error', 'Comment failed to save.');
            res.redirect('back');
        }
    }
    saveComment();
});    

//----------------------------
// .PUT routes
//----------------------------

// save updated comment
router.put('/:comment_id', middleware.isLoggedIn, (req,res)=>{
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
        if(err){
            console.log(err);
            res.redirect('back');
        } else {
            req.flash('success', 'Comment updated.');
            res.redirect('back');
        }
    });
});

//----------------------------
// .DELETE routes
//----------------------------

// delete comments
router.delete("/:comment_id",middleware.isLoggedIn,(req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id,(err) => {
        if(err){
          console.log("failed to .findByIdAndRemove Comment object");  
        } else {
            console.log("Comment with ID:" + req.params.comment_id + " has been deleted");
            req.flash('success', 'Comment deleted.');
            res.redirect('back');
        }
    });
});

// export module
module.exports = router;