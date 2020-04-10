// middleware functions object
const middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
};


// export module
module.exports = middlewareObj;