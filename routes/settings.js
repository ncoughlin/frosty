// ***************************
// EXPRESS SETUP
// ***************************
const express          = require('express'),
      router           = express.Router({mergeParams: true}),
      middleware       = require('../middleware'),
      Blog             = require('../models/blogs'),
      Comment          = require('../models/comments'),
      User             = require('../models/users');
      
    
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

// settings/dashboard
router.get("/dashboard", middleware.isLoggedIn, middleware.profilePhoto2LevelsBack, (req, res) => {
    
    // find all blogs
    function gatherBlogs(){
        return new Promise((resolve, reject)=>{
            Blog.find({}, (err, blogs)=>{
               if(err){
                    req.flash('error', "Unable to retrieve Blogs");
                    res.redirect('back');
                    return;
               } else {
                    resolve(blogs);
               }
            });
        });
    }
    
    // find all comments
    function gatherComments(){
        return new Promise((resolve, reject)=>{
            Comment.find({}, (err, comments)=>{
               if(err){
                    req.flash('error', "Unable to retrieve Blogs");
                    res.redirect('back');
                    return;
               } else {
                    resolve(comments);
               }
            });
        });
    }
    
    // find all users
    function gatherUsers(){
        return new Promise((resolve, reject)=>{
            User.find({}, (err, users)=>{
               if(err){
                    req.flash('error', "Unable to retrieve Blogs");
                    res.redirect('back');
                    return;
               } else {
                    resolve(users);
               }
            });
        });
    }
    
    // count blogs
    function gatherBlogCount(blogs){
        return new Promise((resolve, reject)=>{
            Blog.count({ },(err, count) => {
                if(err){
                    console.log(err);
                } else {
                    console.log('blog count: ' + count);
                    resolve(count);
                }
            });
        });
    }
    
    // count users
    function gatherUserCount(users){
        return new Promise((resolve, reject)=>{
            User.countDocuments({ },(err, count) => {
                if(err){
                    console.log(err);
                } else {
                    console.log('user count: ' + count);
                    resolve(count);
                }
            });
        });
    }
    
    // count comments
    function gatherCommentCount(comments){
        return new Promise((resolve, reject)=>{
            Comment.countDocuments({ },(err, count) => {
                if(err){
                    console.log(err);
                } else {
                    console.log('comments count: ' + count);
                    resolve(count);
                }
            });
        });
    }
    
    // count admins
    function gatherAdminCount(role){
        return new Promise((resolve,reject)=>{
            User.countDocuments({ role: role },(err, count) => {
                if(err){
                    console.log(err);
                } else {
                    console.log('admin count: ' + count);
                    resolve(count);
                }
            });
        });
    }
    
    // count editors
    function gatherEditorCount(role){
        return new Promise((resolve,reject)=>{
            User.countDocuments({ role: role },(err, count) => {
                if(err){
                    console.log(err);
                } else {
                    console.log('editor count: ' + count);
                    resolve(count);
                }
            });
        });
    }
    
    // count writers
    function gatherWriterCount(role){
        return new Promise((resolve,reject)=>{
            User.countDocuments({ role: role },(err, count) => {
                if(err){
                    console.log(err);
                } else {
                    console.log('writer count: ' + count);
                    resolve(count);
                }
            });
        });
    }
    
    // count reader
    function gatherReaderCount(role){
        return new Promise((resolve,reject)=>{
            User.countDocuments({ role: role },(err, count) => {
                if(err){
                    console.log(err);
                } else {
                    console.log('reader count: ' + count);
                    resolve(count);
                }
            });
        });
    }
    

    async function settingsDashboardHandler(){
        try{
            const allBlogs          = await gatherBlogs();
            const allComments       = await gatherComments();
            const allUsers          = await gatherUsers();
            const blogCount         = await gatherBlogCount(allBlogs);
            const userCount         = await gatherUserCount(allUsers);
            const adminCount        = await gatherAdminCount('Administrator');
            const editorCount       = await gatherEditorCount('Editor');
            const writerCount       = await gatherWriterCount('Writer');
            const readerCount       = await gatherReaderCount('Reader');
            const commentCount      = await gatherCommentCount(allComments);
            
            res.render("settings-dashboard.ejs", {blogs: allBlogs, 
                                                  comments: allComments,
                                                  users: allUsers,
                                                  blogcount: blogCount,
                                                  usercount: userCount,
                                                  admincount: adminCount,
                                                  editorcount: editorCount,
                                                  writercount: writerCount,
                                                  readercount: readerCount,
                                                  commentcount: commentCount
                                                });
            
        } catch(err){
            console.log(err);
        }
    }
    settingsDashboardHandler();
  
});

// settings/users
router.get("/users", middleware.isLoggedIn, middleware.profilePhoto2LevelsBack, (req, res) => {
    function gatherUserProfiles(){
        return new Promise((resolve, reject)=>{
            User.find({}, (err, users)=>{
               if(err){
                    req.flash('error', "Unable to retrieve Users data");
                    res.redirect('back');
                    return;
               } else {
                    resolve(users);
               }
            });
        });
    }
    
    function checkProfilePhotos(profiles){
        return new Promise((resolve, reject)=>{
            profiles.forEach((profile)=>{
                if(!profile.photo) {
                    // if there is no profile photo use default photo
                    profile.photo = '/images/default_user_logo.svg';
                } else {
                    // if there is a profile photo use that photo
                    profile.photo = profile.photo;
                }
            });
            resolve(profiles);
        });
    }

async function settingsUsersHandler(){
        try{
            const allUserData                 = await gatherUserProfiles();
            const usersWithVerifiedPhotos     = await checkProfilePhotos(allUserData);
            
            res.render("settings-users.ejs", {users:usersWithVerifiedPhotos});
            
        } catch(err){
            console.log(err);
        }
    }
    settingsUsersHandler();
});    

// settings/general
router.get("/general", middleware.isLoggedIn, middleware.profilePhoto2LevelsBack, (req, res) => {
    res.render("settings-general.ejs");
});

// settings/blogs

router.get("/blogs", middleware.isLoggedIn, middleware.profilePhoto2LevelsBack, (req, res) => {
    
    // find all blogs
    function gatherBlogs(){
        return new Promise((resolve, reject)=>{
            Blog.find({}, (err, blogs)=>{
               if(err){
                    req.flash('error', "Unable to retrieve Blogs");
                    res.redirect('back');
                    return;
               } else {
                    resolve(blogs);
               }
            });
        });
    }
    
    // check the current role of the blog authors and save it to blogs
    function checkCurrentRoleOfAuthor(blogs){
        return new Promise((resolve, reject)=>{
            blogs.forEach((blog)=>{
                User.findById(blog.author.id, (err, user)=>{
                    if(err){
                        req.flash('error', "unable to retrieve blog author");
                        res.redirect('back');
                        return;    
                    } else {
                        blog.author.role = user.role;
                        blog.save();
                    }
                });
            });
            resolve(blogs);
        });
    }

async function settingsBlogsHandler(){
        try{
            const allBlogs                       = await gatherBlogs();
            const blogsWithUpdatedAuthorRole     = await checkCurrentRoleOfAuthor(allBlogs);
            
            res.render("settings-blogs.ejs", {blogs: blogsWithUpdatedAuthorRole});
            
        } catch(err){
            console.log(err);
        }
    }
    settingsBlogsHandler();
});    


// settings/comments
router.get("/comments", middleware.isLoggedIn, middleware.profilePhoto2LevelsBack, (req, res) => {
    
    // find all comments
    function gatherComments(){
        return new Promise((resolve, reject)=>{
            Comment.find({}, (err, comments)=>{
               if(err){
                    req.flash('error', "Unable to retrieve Comments");
                    res.redirect('back');
                    return;
               } else {
                    resolve(comments);
               }
            });
        });
    }
    
    // check the current role of the comment authors and save it to comments
    function checkCurrentRoleOfAuthor(comments){
        return new Promise((resolve, reject)=>{
            comments.forEach((comment)=>{
                User.findById(comment.author.id, (err, user)=>{
                    if(err){
                        req.flash('error', "unable to retrieve comment user");
                        res.redirect('back');
                        return;    
                    } else {
                        comment.author.role = user.role;
                        comment.save();
                    }
                });
            });
            resolve(comments);
        });
    }

async function settingsCommentsHandler(){
        try{
            const allComments                       = await gatherComments();
            const commentsWithUpdatedAuthorRole     = await checkCurrentRoleOfAuthor(allComments);
            
            res.render("settings-comments.ejs", {comments: commentsWithUpdatedAuthorRole});
            
        } catch(err){
            console.log(err);
        }
    }
    settingsCommentsHandler();
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