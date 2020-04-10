// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
      middleware       = require('../middleware'),
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

// user profile page
router.get("/:id/profile",middleware.isLoggedIn, (req, res) => {
    
    function checkProfileExists(requestedProfileID){
        return new Promise((resolve,reject)=>{
           console.log("Checking that Profile of User " + requestedProfileID + "still exists");
           User.findById(requestedProfileID, (err, foundProfile) =>{
               if(err){
                   console.log(err);
               } else if(!foundProfile) {
                   req.flash('error', 'Profile does not exist.');
                   res.redirect('back');
                   // redirect does not end statement like res.render
                   // so we must return to end process
                   return;
               } else {
                   console.log(foundProfile);
                   resolve(true);
               }
           });
        });
    }
    
    function getUserData(IDNumber){
        return new Promise((resolve,reject)=>{
            console.log("Requesting user data of: "+ IDNumber);
            resolve(User.findById(IDNumber));
        });
    }

    // if user is not administrator render profile page
    function getAdminStatus(userData){
        return new Promise((resolve,reject)=>{
           console.log("Retreiving user role of: " + userData.username);
           
           if(userData.role === "Administrator"){
               resolve(true);
           } else if(userData.role != "Administrator") {
                User.findById(req.params.id, (err, foundUser) => {
                    if(err) {
                        console.log(err);
                    } else {
                    let adminDanger = false;
                    console.log('No Admin Danger');
                    res.render("userProfile.ejs", {user: foundUser, admindanger: adminDanger}); 
                    }
                });   
           } else {   
               console.log("Error retreiving status of user role.");
               reject("Error retreiving status of user role.");
           }
        });
    }

    function getAdminCount(role){
        return new Promise((resolve,reject)=>{
            User.countDocuments({ role: role },(err, count) => {
                                if(err){
                                    console.log(err);
                                } else {
                                    resolve(count);
                                }
                            });
        });
    }
    
    
    
    // first check that user profile still exists (user was not deleted)
    // if user is the last administrator and is editing the profile
    // of the last administrator, prevent them from changing roles
    async function checkProfileExistsAndAdminDanger(){
        try{
            // login check handled by middleware
            const profileExists = await checkProfileExists(req.params.id);
            const currentUserData = await getUserData(res.locals.currentUser.id);
            console.log("Current User: " + currentUserData.username);
            const isAdmin = await getAdminStatus(currentUserData);
            console.log("User is Administrator: " + isAdmin);
            const numberOfAdmins = await getAdminCount('Administrator');
            console.log("Current Number of Administrators: " + numberOfAdmins);
            
            if(profileExists === false){
                res.send("This user no longer exists.");
            } else {
                User.findById(req.params.id, (err, foundUser) => {
                
                    // get role of current profile
                    let profileRole = foundUser.role;
                    console.log('Current user is: ' + profileRole);
                    if(err){
                        console.log(err);
                    } else if(profileExists === false){
                        res.send("This user no longer exists.");
                    } else if(isAdmin === true && numberOfAdmins <= 1 && profileRole === "Administrator"){
                            let adminDanger = true;
                            console.log('ADMIN DANGER: There is only 1 administrator');
                            res.render("userProfile.ejs", {user: foundUser, admindanger: adminDanger});
                    } else {
                        let adminDanger = false;
                        console.log('No Admin Danger');
                        res.render("userProfile.ejs", {user: foundUser, admindanger: adminDanger});
                    }   
                    
                });
            }
        } catch(err) {
            console.log(err);
        }
    }
    checkProfileExistsAndAdminDanger();
});

//----------------------------
// .POST routes
//----------------------------



//----------------------------
// .PUT routes
//----------------------------

// edit user
router.put("/:id",middleware.isLoggedIn,(req, res) => {
    // sanitize inputs
    req.body.user.firstname = req.sanitize(req.body.user.firstname);
    req.body.user.lastname = req.sanitize(req.body.user.lastname);
    req.body.user.username = req.sanitize(req.body.user.username);
    
    
    // find and update user
    User.findByIdAndUpdate(req.params.id, req.body.user,(err, foundUser) => {
        if(err){
            console.log("Error: Failed to update user");
        } else {
            console.log("Success: User updated");
            // redirect to updated user profile
            req.flash('success', 'User profile updated.');
            res.redirect("/users/" + req.params.id + "/profile");
        }
    });
    
}); 

//----------------------------
// .DELETE routes
//----------------------------

// delete user
router.delete("/:id",middleware.isLoggedIn,(req, res) => {
    User.findByIdAndRemove(req.params.id,(err) => {
        if(err){
          console.log("Error: failed to delete user");  
        } else {
            console.log("User with username:" + req.params.username + " has been deleted");
            req.flash('success', 'User has been deleted.');
            res.redirect("/settings/users");
        }
    });
});


// export module
module.exports = router;