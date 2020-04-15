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
router.get("/dashboard", middleware.isLoggedIn, (req, res) => {
    res.render("settings-dashboard.ejs");
});

// settings/users
router.get("/users", middleware.isLoggedIn, (req, res) => {
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

/*router.get("/users", middleware.isLoggedIn, (req, res) => {
    // get users from database
    User.find({},(err, users) => {
        if(err){
            console.log("Error: Unable to retrieve user data");
        } else {
            res.render("settings-users.ejs", {users:users});
        }
    });
});*/

// settings/general
router.get("/general", middleware.isLoggedIn, (req, res) => {
    res.render("settings-general.ejs");
});

// settings/blogs
router.get("/blogs", middleware.isLoggedIn, (req, res) => {
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
router.get("/comments", middleware.isLoggedIn, (req, res) => {
    
    Comment.find({},(err,comments)=>{
        if(err){
            console.log(err);
        } else {
            res.render('settings-comments.ejs', {comments: comments});
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