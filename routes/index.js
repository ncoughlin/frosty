// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
      passport         = require('passport'),
      User             = require('../models/users'),
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
// EXPERIMENT ZONE
// ***************************

// get count of administrators
function countAdmins(){
    User.countDocuments({ role: 'Administrator' },(err, count) => {
        if(err){
            console.log(err);
        } 
        console.log('There are: ' + count + ' Administrators' );
    });
}

// if user is logged in go to next, if not load index
function checkLogin(req, res, next){
    //  If user is logged in
    if(req.isAuthenticated()){
        return next();
    }
    //  If not logged in, redirect to index
    Blog.find({},(err, blogs) => {
        if(err){
            console.log("Error: Unable to retreive blog data.");
        } else {
            res.render("index.ejs", {blogs:blogs});
        }
    });
}

// If user is administrator check if there are more than one administrator
// and prevent user role change if there is only one
function checkAdministratorCount() {
        
        router.get("/",checkLogin,(req, res) => {
        // Is user logged in? in middleware
        //  Find Current User
        User.findById(res.locals.currentUser.id, (err, foundUser) => {
            if(err){
                console.log(err);
            } else {
                    console.log(foundUser);
                    //  Check if current user is Administrator
                    if(foundUser.role == "Administrator"){
                        console.log("User is an Administrator");
                        // Get count of administrators.
                        User.countDocuments({ role: 'Administrator' },(err, count) => {
                            if(err){
                                console.log(err);
                            } 
                                console.log('There are: ' + count + ' Administrators' );
                                if(count <= 1){
                                    res.send("There is only one administrator");
                                    
                                } else {
                                    res.send("There is more than one administrator");
                                  
                                }
                            });
                        
                    } else {
                    //  If no load index.
                        Blog.find({},(err, blogs) => {
                        if(err){
                            console.log("Error: Unable to retreive blog data.");
                        } else {
                            res.render("index.ejs", {blogs:blogs});
                        }
                    });
                }  
            }
        });
    });
};
//checkAdministratorCount();

function getUserData(IDNumber){
    return new Promise((resolve,reject)=>{
        console.log("Requesting user data of: "+ IDNumber);
        resolve(User.findById(IDNumber));
    });
}

function getAdminStatus(userData){
    return new Promise((resolve,reject)=>{
       console.log("Retreiving user role of: " + userData.username);
       if(userData.role === "Administrator"){
           resolve(true);
       } else {
           reject("User is not administrator");
       }
    });
}

function getAdminCount(role){
    return new Promise((resolve,reject)=>{
        User.countDocuments({ role: role },(err, count) => {
                            if(err){
                                console.log(err);
                            } else {
                                if(count <= 1){
                                    resolve(count);
                                } else {
                                    reject("There is more than 1 administrator");
                                }
                            }
                        });
    });
}

router.get("/",isLoggedIn,(req, res) => {
    
    async function checkAdminCount(){
        try{
            // login check will be done by router middleware
        const currentUserData = await getUserData(res.locals.currentUser.id);
        console.log("Current User: " + currentUserData.username);
        const isAdmin = await getAdminStatus(currentUserData);
        console.log("User is Administrator: " + isAdmin);
        const numberOfAdmins = await getAdminCount('Administrator');
        console.log("There are " + numberOfAdmins + " admins");
        } catch(err) {
            console.log(err);
        }
    }
    checkAdminCount();
    
    // render index
    Blog.find({},(err, blogs) => {
        if(err){
            console.log("Error: Unable to retreive blog data.");
        } else {
            res.render("index.ejs", {blogs:blogs});
        }
    });
});

// Is user logged in?
//  If no redirect to homepage 
//  If yes NEXT
// Is user an administrator? 
//  If no continue as normal 
//  If yes NEXT
// Get count of administrators. 
// Is count <=1 ?
//  If yes prevent user from making changes
//  If no continue as normal



   

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
    res.redirect("/");
});

//----------------------------
// .POST routes
//----------------------------

// new user registration: save user to database and authenticate them
router.post("/register", (req, res) => {
    
    req.body.firstname = req.sanitize(req.body.firstname);
    req.body.lastname = req.sanitize(req.body.lastname);
    req.body.username = req.sanitize(req.body.username);
    
  let newUser = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    // default role for all users is Reader
    role: "Administrator",
    email: req.body.email,
    username: req.body.username
  });
  User.register(newUser, req.body.password, (err, user) => {
    console.log("attempting user registration");
    if (err) {
      console.log(err);
      return res.render("register.ejs");
    }
    passport.authenticate("local")(req, res, () => {
      res.redirect("/");
    });
    console.log("user registration successful: " + newUser.username);
  });
});

// login user: authenticate user
// app.post("/login", middleware, callback)
router.post("/login",passport.authenticate("local", {
                                                    successRedirect: "..",
                                                    failureRedirect: "/login"
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