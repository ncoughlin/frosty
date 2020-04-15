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
router.get("/:id/profile",middleware.isLoggedIn, middleware.profilePhoto3LevelsBack, (req, res) => {
    
    // does requested profile exist?
    function checkProfileExists(requestedProfileID){
        return new Promise((resolve,reject)=>{
           console.log("Checking that Profile of User " + requestedProfileID + "still exists");
           User.findById(requestedProfileID, (err, foundProfile) =>{
               if(err){
                   console.log(err);
               } else if(!foundProfile) {
                   req.flash('error', 'Profile does not exist.');
                   res.redirect('back');
                   return;
               } else {
                   resolve(true);
               }
           });
        });
    }
    
    // does requested profile exist?
    function retrieveProfileData(requestedProfileID){
        return new Promise((resolve,reject)=>{
            console.log("Gathering profile data of: " + requestedProfileID);
            User.findById(requestedProfileID, (err, foundProfile) =>{
                if(err){
                   req.flash('error', 'Could not retrieve profile data.');
                   res.redirect('back');
                   console.log(err);
                } else {
                   resolve(foundProfile);
                }
            });
        });
    }
    
    // is user reader or writer?
    function checkIfUserIsReader(user){
        return new Promise((resolve, reject)=>{
            if(user.role === 'Reader'){
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
    
    // is user reader or writer?
    function checkIfUserIsWriter(user){
        return new Promise((resolve, reject)=>{
            if(user.role === 'Writer'){
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
    
    // is user editor or admin?
    function checkAdminEditorOrWriter(user){
        return new Promise((resolve, reject)=>{
            if(user.role === 'Editor' || user.role === 'Administrator' || user.role === 'Writer'){
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
   
   // is user requesting their own profile? 
    function matchingProfile(){
        return new Promise((resolve, reject)=>{
            if(res.locals.currentUser.id === req.params.id) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
    
    function getUserData(IDNumber){
        return new Promise((resolve,reject)=>{
            console.log("Requesting user data of: "+ IDNumber);
            resolve(User.findById(IDNumber));
        });
    }

    // is user an administrator?
    function getUserAdminStatus(userData){
        return new Promise((resolve,reject)=>{
           console.log("Retreiving user role of: " + userData.username);
           
           if(userData.role === "Administrator"){
                resolve(true);
           } else if(userData.role != "Administrator") {
                resolve(false);
           } else {   
               console.log("Error retreiving status of user role.");
               reject("Error retreiving status of user role.");
           }
        });
    }
    
    // is profile administrator?
    function getProfileAdminStatus(profile){
        return new Promise((resolve,reject)=>{
            if(profile.role === 'Administrator'){
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
    
    // is profile reader?
    function checkIfProfileIsReader(profile){
        return new Promise((resolve,reject)=>{
            if(profile.role === 'Reader'){
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
    
    // is profile admin or editor?
    function CheckProfileIsAdminOrEditor(profile){
        return new Promise((resolve,reject)=>{
            if(profile.role === 'Administrator' || profile.role === 'Editor'){
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }

    // count total administrators
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
    function checkProfilePhoto(profile){
        return new Promise((resolve,reject)=>{
            if(!profile.photo) {
                // if there is no profile photo use default photo
                console.log('User has no profile photo.');
                resolve('/images/default_user_logo.svg');
            } else {
                // if there is a profile photo use that photo
                console.log('User has a profile photo.');
                resolve(profile.photo);
            }
        });
    }
    
    
    // is there a danger of removing the last administrator?
    function checkAdminDanger(userAdmin,number,profileAdmin){
        return new Promise((resolve,reject)=>{
            if(userAdmin === true && number <= 1 && profileAdmin === true){
                resolve(true);
            } else {
                resolve(false);
            }
        });
    }
    
    
    // first check that user profile still exists (user was not deleted)
    // if user is the last administrator and is editing the profile
    // of the last administrator, prevent them from changing roles
    // check if user already has a profile photo and if not use default photo
    async function profileRequestHandler(){
        try{
            // login check handled by middleware
            
            const profileExists              = await checkProfileExists(req.params.id);
            const profileData                = await retrieveProfileData(req.params.id);
            const userData                   = await getUserData(res.locals.currentUser.id);
            const userIsReader               = await checkIfUserIsReader(userData);
            const userIsWriter               = await checkIfUserIsWriter(userData);
            const userIsAdminEditorOrWriter  = await checkAdminEditorOrWriter(userData);
            const profileOwner               = await matchingProfile();
            const userIsAdmin                = await getUserAdminStatus(userData);
            const profileIsAdmin             = await getProfileAdminStatus(profileData);
            const profileIsReader            = await checkIfProfileIsReader(profileData);
            const profileIsAdminOrEditor     = await CheckProfileIsAdminOrEditor(profileData);
            const numberOfAdmins             = await getAdminCount('Administrator');
            const profilePhoto               = await checkProfilePhoto(profileData);
            const adminDanger                = await checkAdminDanger(userIsAdmin,numberOfAdmins,profileIsAdmin);
            
            // photo is determined by checkProfilePhoto()    
            profileData.photo = profilePhoto;   
            
            console.log('...........................');
            
            // if no profile go back
            if(profileExists === false){
                req.flash('error', "That user no longer exists");
                res.redirect('back');
                return;
            // if user is reader and it's not their profile go back    
            } else if(userIsReader === true && profileOwner === false) {
                req.flash('error', "Readers can only view their own profiles");
                res.redirect('back');
                return;
            // writers cannot view reader profiles
            } else if(userIsWriter === true && profileIsReader === true) {
                req.flash('error', "Writers cannot view readers profiles for privacy reasons");
                res.redirect('back');
                return;
            // if  Admin Editor, Writer or Profile Owner, load profile   
            } else if(userIsAdminEditorOrWriter === true || profileOwner === true){
            
                console.log('rendering profile');
                res.render("userProfile.ejs", {profile: profileData, admindanger: adminDanger, profileowner: profileOwner, profileisadminoreditor:profileIsAdminOrEditor});
                
            } else {
                req.flash('error', "Unable to determine authorization");
                res.redirect('back');
                return;
            }
            
        } catch(err) {
            console.log(err);
        }
    }
    profileRequestHandler();
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