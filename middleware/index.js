// middleware functions object
const middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    req.flash('error', 'You must be logged in to do that.');
    res.redirect("/login");
};


// export module
module.exports = middlewareObj;