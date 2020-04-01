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



//----------------------------
// .POST routes
//----------------------------



//----------------------------
// .PUT routes
//----------------------------



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