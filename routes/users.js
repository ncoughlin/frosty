// ***************************
// EXPRESS SETUP
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
      middleware       = require('../middleware'),
      User             = require('../models/users'),
      multer           = require('multer'),
      storage          = multer.diskStorage({
          filename: (req, file, callback)=>{
              callback(null, Date.now() + file.originalname);
          }
      }),
      imageFilter      = (req, file, cb)=>{
        // accept image files only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
        },
      upload           = multer({storage: storage, fileFilter: imageFilter}),    
      cloudinary       = require('cloudinary');
      
      
// ***************************
// Cloudinary Config
// *************************** 
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});           
    
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
    
    // check if user already has a profile photo and if not use default photo
    function checkProfilePhoto(requestedProfileID){
        return new Promise((resolve,reject)=>{
            User.findById(requestedProfileID, (err, foundProfile) =>{
               if(err){
                   console.log(err);
                   req.flash('error', "There was a problem retreiving user profile.");
                    res.redirect('back');
                return;
               } else if(!foundProfile.photo) {
                   // if there is no profile photo use default photo
                   console.log('User has no profile photo.');
                   resolve('/images/default_user_logo.svg');
               } else {
                   // if there is a profile photo use that photo
                   console.log('User has a profile photo.');
                   resolve(foundProfile.photo);
               }
           });
        });
    }
    
    
    
    // first check that user profile still exists (user was not deleted)
    // if user is the last administrator and is editing the profile
    // of the last administrator, prevent them from changing roles
    // check if user already has a profile photo and if not use default photo
    async function checkProfileExistsAndAdminDangerandProfilePhoto(){
        try{
            // login check handled by middleware
            const profileExists = await checkProfileExists(req.params.id);
            const currentUserData = await getUserData(res.locals.currentUser.id);
            console.log("Current User: " + currentUserData.username);
            const isAdmin = await getAdminStatus(currentUserData);
            console.log("User is Administrator: " + isAdmin);
            const numberOfAdmins = await getAdminCount('Administrator');
            console.log("Current Number of Administrators: " + numberOfAdmins);
            const userPhoto = await checkProfilePhoto(req.params.id);
            
            if(profileExists === false){
                req.flash('error', "That user no longer exists");
                res.redirect('back');
                return;
            } else {
                User.findById(req.params.id, (err, foundUser) => {
                
                // photo is result of checkProfilePhoto()    
                foundUser.photo = userPhoto;    
                
                // get role of current profile
                let profileRole = foundUser.role;
                console.log('Current user is: ' + profileRole);
                if(err){
                    console.log(err);
                    req.flash('error', "Could not find User Profile");
                    res.redirect('back');
                    return;
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
    checkProfileExistsAndAdminDangerandProfilePhoto();
});

//----------------------------
// .POST routes
//----------------------------



//----------------------------
// .PUT routes
//----------------------------

// edit user
router.put("/:id",middleware.isLoggedIn, upload.single('user[photo]'), (req, res) => {
    
    // find and update user
    User.findById(req.params.id, async function(err, user){
        if(err){
            req.flash('error', err.message);
            res.redirect('back');
            console.log(err);
            return;
        } else {
            // if file upload is requested
            if (req.file){
                try {
                    // if we attept to destroy a photo that does not exist we will throw an error
                    if(typeof user.photoId != "undefined"){
                        console.log('Destroying Photo with ID: ' + user.photoId);
                        await cloudinary.v2.uploader.destroy(user.photoId);    
                    }
                    let newImage = await cloudinary.v2.uploader.upload(req.file.path);
                    user.photoId = newImage.public_id;
                    user.photo = newImage.secure_url;
                } catch(err){
                    req.flash('error', err.message);
                    res.redirect('back');
                    return;
                }
            }
            
            // sanitize inputs
            req.body.user.firstname = req.sanitize(req.body.user.firstname);
            req.body.user.lastname  = req.sanitize(req.body.user.lastname);
            req.body.user.username  = req.sanitize(req.body.user.username);
            
            // assign variables to incoming data
            user.firstname = req.body.user.firstname;
            user.lastname  = req.body.user.lastname;
            user.username  = req.body.user.username;
            user.email     = req.body.user.email;
            user.role      = req.body.user.role;
            
            user.save();
            console.log("Success: User updated");
            req.flash('success', 'User profile updated.');
            // redirect to updated user profile
            res.redirect("/users/" + req.params.id + "/profile");
            return;
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