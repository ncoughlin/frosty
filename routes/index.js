// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
      middleware       = require('../middleware'),
      passport         = require('passport'),
      User             = require('../models/users'),
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

// landing page
router.get("/", middleware.profilePhoto, (req, res) => {
    
    function retrieveBlogs(){
        return new Promise((resolve,reject)=>{
            Blog.find({},(err, blogs)=>{
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
    
    
    function updateAuthorInfo(blogs){
        return new Promise((resolve,reject)=>{
           blogs.forEach((blog)=>{
                User.findById(blog.author.id, (err, user)=>{
                    if(err){
                        req.flash('error', "unable to retrieve blog author");
                        res.redirect('back');
                        return;    
                    } else {
                        if (typeof user.photo === 'undefined' || typeof user.photo === undefined){
                            blog.author.photo = 'images/default_user_logo.svg';
                            blog.author.username  = user.username;
                            blog.author.firstname = user.firstname;
                            blog.author.lastname  = user.lastname;
                            blog.save();
                        } else {
                            blog.author.photo  = user.photo;
                            blog.author.username  = user.username;
                            blog.author.firstname = user.firstname;
                            blog.author.lastname  = user.lastname;
                            blog.save();
                        }
                    }
                });
            });
            resolve(blogs); 
        });
    }

    async function renderHomepage(){
        try{
            const allBlogs                  = await retrieveBlogs();
            const updatedAuthorInfoOnBlogs  = await updateAuthorInfo(allBlogs);
        
            
            
            res.render("index.ejs", {blogs:updatedAuthorInfoOnBlogs});
            
        } catch(err) {
            console.log(err);
        }
    }
    renderHomepage();
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
    req.flash('success', 'You have been logged out.');
    res.redirect("/");
});

//----------------------------
// .POST routes
//----------------------------

router.post("/register", (req, res) => {

// new user registration: save user to database and authenticate them
// count current users    
// if current user count is 0 new user role is Administrator
// otherwise new user role is Reader    

    function constructUser(userCount){
        return new Promise((resolve,reject)=>{
            if(userCount === 0){
                let newUser = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                // first user is administrator
                role: "Administrator",
                email: req.body.email,
                username: req.body.username
                });
                resolve(newUser);
            } else {
                let newUser = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                // first user is administrator
                role: "Reader",
                email: req.body.email,
                username: req.body.username
                });
                resolve(newUser);
            }
        });
    }

    async function firstUserIsAdmin(){
        try{
            const userCount = await User.countDocuments({});
            console.log("Current number of users is: " + userCount);
            const newUser = await constructUser(userCount); 
            console.log("New User Information: " + newUser);
            
            User.register(newUser, req.body.password, (err, user) => {
                console.log("attempting user registration");
                if (err) {
                    console.log(err);
                    // populating flash with default messages from passport
                    req.flash('error', err.message);
                    res.redirect('back');
                    return;
                }
                
                passport.authenticate("local")(req, res, () => {
                    req.flash('success', 'New user registered.');
                    res.redirect("/");
                    return;
                });
                console.log("user registration successful: " + newUser.username);
            });
            
        } catch(err) {
            console.log(err);
        }
    }
    firstUserIsAdmin();
});


// login user: authenticate user
// app.post("/login", middleware, callback)
router.post("/login",passport.authenticate("local", {
                                                    successRedirect: "/",
                                                    failureRedirect: "/login",
                                                    failureFlash: true
                                                }), (req, res) => {}
);

//----------------------------
// .PUT routes
//----------------------------

//----------------------------
// .DELETE routes
//----------------------------



// export module
module.exports = router;