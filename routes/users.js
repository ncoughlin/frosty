// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
      User             = require('../models/users');
    
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

// edit user form
router.get("/:id/edit",isLoggedIn, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err){
            console.log(err);
        } else {
            res.render("editUser.ejs", {user: foundUser});     
        }
    });
});

//----------------------------
// .POST routes
//----------------------------



//----------------------------
// .PUT routes
//----------------------------

// edit user
router.put("/:id",isLoggedIn,(req, res) => {
    // sanitize inputs
    req.body.user.firstname = req.sanitize(req.body.user.firstname);
    req.body.user.lastname = req.sanitize(req.body.user.lastname);
    req.body.user.username = req.sanitize(req.body.user.username);
    
    // find and update blog
    User.findByIdAndUpdate(req.params.id, req.body.user,(err, foundUser) => {
        if(err){
            console.log("Error: Failed to update user");
        } else {
            console.log("Success: User updated");
            // redirect to updated single post page
            res.redirect("/settings/users/");
        }
    });
    
}); 

//----------------------------
// .DELETE routes
//----------------------------

// delete post
router.delete("/:id",isLoggedIn,(req, res) => {
    User.findByIdAndRemove(req.params.id,(err) => {
        if(err){
          console.log("Error: failed to delete user");  
        } else {
            console.log("User with username:" + req.params.username + " has been deleted");
            res.redirect("/settings/users");
        }
    });
});


// export module
module.exports = router;