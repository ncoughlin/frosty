// ***************************
// IMPORT PACKAGES
// ***************************
const express          = require("express"),
      router           = express.Router({mergeParams: true}),
      middleware       = require('../middleware'),
      moment           = require('moment'),
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
      cloudinary       = require('cloudinary'),
      Blog             = require('../models/blogs'),
      User             = require('../models/users'),
      Comment          = require('../models/comments');
      

// ***************************
// Cloudinary Config
// *************************** 
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});     
      
    
// ***************************
// GLOBAL VARIABLES
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

// landing page is in index.js

// blogs index
router.get("/",(req, res) => {
// get blogs from database 
    Blog.find({},(err, blogs) => {
        if(err){
            console.log("Error: Unable to retreive blog data.");
            req.flash('error', 'Unable to retreive blog data.');
            res.redirect('/');
            return;
        } else {
            res.render("index.ejs", {blogs:blogs});
        }
    });
});

// new blog form
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("newBlog.ejs");
});


// edit blog form
router.get("/:id/edit",middleware.isLoggedIn, (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            console.log(err);
            req.flash('error', 'Unable to edit blog.');
            res.redirect('back');
            return;
        } else {
            console.log( moment(foundBlog.date).format('YYYY-MM-DD'));
            res.render("editBlog.ejs", {blog: foundBlog});     
        }
    });
});
           

// render individual blog. This is a wildcard link and must therefore be
// placed after static links in the application!
router.get("/:id", middleware.profilePhoto2LevelsBack, (req, res) => {
    
    // evaluate if the user should be able to edit (for comments)
    function editorCheck(){
        return new Promise((resolve, reject)=>{
            // First check if user is logged in
            if(!req.isAuthenticated()){
                resolve(false);
            // If user role = Editor || Admin
            //  let editAllow = true;    
            } else if (req.user.role === "Administrator" || req.user.role === "Editor"){
                resolve(true);
            //  if the user is any other role    
            } else {
                resolve(false);
            }
        });
    }    
    
    // use default profile photo is author has no profile image
    function checkProfileImage(id){
        return new Promise((resolve,reject)=>{
            Blog.findById(id,(err, blog)=>{
                if(err){
                    console.log(err);
                } else if (blog.author.photo === 'undefined' || typeof blog.author.photo === undefined || blog.author.photo === "images/default_user_logo.svg"){
                    resolve("../images/default_user_logo.svg");
                } else {
                    resolve(blog.author.photo);
                }
            });
        });
    }
    
    /*// retrieve full comment data by blog ID
    function retrieveComments(id){
        return new Promise((resolve,reject)=>{
            Blog.findById(id,(err, singleBlog)=>{
               
               console.log(singleBlog.comments);
                
               if(err){
                   console.log(err);
               } else {
                   let fullComments = {};
                   
                   for (let i=0; i < singleBlog.comments.length; i++){
                       Comment.findById(singleBlog.comments[i].id,(err, foundComment)=>{
                           if(err){
                               console.log(err);
                           } else {
                               console.log(fullComments[i]);
                               fullComments[i] = foundComment;
                           }
                       });
                   }
                   console.log(fullComments);
                   resolve(fullComments);
               }
            });
        });
    }
    
    function saveProfileImagesToComments(comments){
        return new Promise((resolve,reject)=>{
            console.log(comments);
           comments.forEach((comment) => {
               User.findById(comment.author.id,(err,commentAuthor)=>{
                   if (err){
                       console.log(err);
                   } else {
                       comment.author.image = commentAuthor.photo;
                       console.log(comment);
                       comment.save();
                   }
               });
           }); 
           console.log(comments);
           resolve(comments);
        });
    }*/
    
    
     // use default profile photo is author has no profile image
    function retrieveComments(id){
        return new Promise((resolve,reject)=>{
            Comment.find({blogID: id},(err, foundComments)=>{
                if(err){
                    console.log(err);
                } else {
                    resolve(foundComments);
                }
            });
        });
    }
    
   // use default profile photo is comment author has no profile image
   /* function checkCommentImages(comments){
        return new Promise((resolve,reject)=>{
            comments.forEach((comment)=>{
                if (comment.author.image === 'undefined' || typeof comment.author.image === undefined || comment.author.image === "images/default_user_logo.svg"){
                    console.log('NO COMMENT IMAGE');
                    comment.author.image = "/images/default_user_logo.svg";
                    comment.save();
                } else {
                    comment.author.image = comment.author.image;
                }
            });
            console.log('UPDATED COMMENTS');
            console.log(comments);
            resolve(comments);
        });
    } */
    
    // check if user has blanket permission to edit a comment before loading page.
    // populate comments
    
    async function singleBlogRouter(){
        try {
            const editPermission                   = await editorCheck();
            const profileImage                     = await checkProfileImage(req.params.id);
            const fullComments                     = await retrieveComments(req.params.id);
            /*const commentsWithImagesChecked        = await checkCommentImages(fullComments);*/
            /*const completeComments                 = await retrieveComments(req.params.id);
            const profileImagesSavedToComments     = await saveProfileImagesToComments(completeComments);
            */
        
        
            Blog.findById(req.params.id,(err, dbData) => {
                if(err){
                    console.log("error finding blog data by ID");
                    req.flash('error', 'error finding blog data by ID');
                    res.redirect('/');
                    return;
                } else {
                    // render single post template with that post data
                    res.render("singleBlog.ejs", {blog: dbData, editPermission: editPermission, profileimage: profileImage, comments: fullComments});
                    console.log("Article: " + dbData.title + " has loaded.");
                }
            });
        } catch(err) {
            console.log(err);
        }
    }
    singleBlogRouter();
});
        
        
            // Find Blog by ID and populate comments
            /*Blog.findById(req.params.id).
            // populate comments
            populate("comments").
            exec((err, dbData) => {
                if(err){
                    console.log("error finding blog data by ID");
                    req.flash('error', 'error finding blog data by ID');
                    res.redirect('/');
                    return;
                } else {
                    // render single post template with that post data
                    res.render("singleBlog.ejs", {blog: dbData, editPermission: editPermission, profileimage: profileImage});
                    console.log("Article: " + dbData.title + " has loaded.");
                }
            });
        } catch(err) {
            console.log(err);
        }
    }
    singleBlogRouter();
});
*/
//----------------------------
// .POST routes
//----------------------------

// new blog: receive and save
router.post("/", middleware.isLoggedIn, upload.single('blog[image]'), (req, res) => {
    // sanitize inputs
    req.body.blog.title   = req.sanitize(req.body.blog.title);
    req.body.blog.short   = req.sanitize(req.body.blog.short);
    req.body.blog.content = req.sanitize(req.body.blog.content);
    
    // assign variables to incoming data
    let title   = req.body.blog.title,
        short   = req.body.blog.short,
        content = req.body.blog.content,
        date    = req.body.blog.date;
    
    // retriever user data
    let author = {
        id: req.user._id,
        username: req.user.username,
        firstname: req.user.firstname,
        lastname: req.user.lastname
    };
    
    // add cloudinary url for the image to the blog object under image property
    cloudinary.v2.uploader.upload(req.file.path, (error, result)=> {
        console.log(result, error);
        
        let image   = result.secure_url,
            imageId = result.public_id;
        
        // combine all data into new variable
        let newBlog = {title: title, image: image, imageId: imageId, short: short, content: content, date: date, author: author};
        
        // save combined data to new blog
        Blog.create(newBlog,(err, newDatabaseRecord) => {
            if(err){
                console.log(err);
                req.flash('error', "Failed to write post to database.");
                res.redirect('back');
                return;
            } else {
                console.log("Blog successfully saved to database.");
                console.log(newDatabaseRecord);
                req.flash('success', 'New blog saved to database.');
                // redirect back to blogs page
                 res.redirect("/");
                 return;
            }
        });
    });
});

//----------------------------
// .PUT routes
//----------------------------

// edit blog
router.put("/:id",middleware.isLoggedIn, upload.single('blog[image]'), (req, res) => {
    // only upload new photo if requested
    Blog.findById(req.params.id, async function(err, blog){
       if(err){
           req.flash('error', err.message);
           res.redirect('back');
           return;
       } else {
           if (req.file) {
               try {
                   await cloudinary.v2.uploader.destroy(blog.imageId);
                   let newImage = await cloudinary.v2.uploader.upload(req.file.path);
                   blog.imageId = newImage.public_id;
                   blog.image = newImage.secure_url;
                   
               } catch(err) {
                   req.flash('error', err.message);
                   res.redirect('back');
                   return;
               }
           }
            // sanitize inputs
            req.body.blog.title = req.sanitize(req.body.blog.title);
            req.body.blog.short = req.sanitize(req.body.blog.short);
            req.body.blog.content = req.sanitize(req.body.blog.content);
            
            // assign variables to incoming data
            blog.title   = req.body.blog.title;
            blog.author  = blog.author;
            blog.short   = req.body.blog.short;
            blog.content = req.body.blog.content;
            blog.date    = req.body.blog.date;
            blog.imageId = blog.imageId;
            blog.image   = blog.image;
            
            blog.save();
            req.flash('success', "Blog updated.");
            res.redirect('/blogs/' + blog._id);
            return;
       }
    });
});    
    

//----------------------------
// .DELETE routes
//----------------------------

// delete post
router.delete("/:id",middleware.isLoggedIn,(req, res) => {
    Blog.findById(req.params.id, async function (err,blog){
        if(err){
            console.log("failed to .findByIdAndRemove Blog object");
            req.flash('error', err.message);
            res.redirect('back');
            return;
        } else {
            try {
                await cloudinary.v2.uploader.destroy(blog.imageId);
                console.log("Blog image with ID:" + blog.imageId + " has been deleted from cloudinary.");
                blog.remove();
                console.log("Blog with ID:" + req.params.id + " has been deletedj.");
                req.flash('success', 'Blog has been deleted.');
                res.redirect("back");
                return;
            } catch(err) {
                req.flash('error', err.message);
                res.redirect('back');
                return;
            }
        }
    });
});


// export module
module.exports = router;