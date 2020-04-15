// middleware functions object
const middlewareObj = {};

// check if user is logged in
middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You must be logged in to do that.');
    res.redirect("/login");
};

// if user is logged in but has no profile photo supply default photo for navbar
middlewareObj.profilePhoto = (req, res, next)=>{
    // logged in
    if(req.user && req.user.photo === undefined){

        console.log("current user does not have a profile picture");
        req.user.photo = 'images/default_user_logo.svg';
        return next();    
        
    // not logged in    
    } else {
        console.log("no current user");
        return next();
    }
};

// if user is logged in but has no profile photo supply default photo for navbar
middlewareObj.profilePhoto2LevelsBack = (req, res, next)=>{
    // logged in
    if(req.user && req.user.photo === undefined){

        console.log("current user does not have a profile picture");
        req.user.photo = '../../images/default_user_logo.svg';
        return next();    
        
    // not logged in    
    } else {
        console.log("no current user");
        return next();
    }
};

// if user is logged in but has no profile photo supply default photo for navbar
middlewareObj.profilePhoto3LevelsBack = (req, res, next)=>{
    // logged in
    if(req.user && req.user.photo === undefined){

        console.log("current user does not have a profile picture");
        req.user.photo = '../../../images/default_user_logo.svg';
        return next();    
        
    // not logged in    
    } else {
        console.log("no current user");
        return next();
    }
};


// export module
module.exports = middlewareObj;