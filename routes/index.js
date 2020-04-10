// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
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
                                                    successRedirect: "..",
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