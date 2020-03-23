
// ***************************
// EXPRESS SETUP
// ***************************

console.log("app.js is connected");

// import modules
const express          = require("express"),
      app              = express(),
      bodyParser       = require("body-parser"),
      mongoose         = require("mongoose"),
      methodOverride   = require("method-override"),
      expressSanitizer = require('express-sanitizer'),
      Blog             = require("./models/blogs"),
      Comment          = require("./models/comments"),
      seedDB           = require("./seeds");
      

// set listen port
// must set listen port to 8080 for public viewing. see https://ncoughlin.com/aws-cloud9-making-express-js-server-publicly-available/
app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Listening on PORT: " + process.env.PORT + " at IP: " + process.env.IP);
});


// direct express to static files like CSS and Logos
app.use(express.static("public"));
// use body-parser
app.use(bodyParser.urlencoded({extended:true}));
// use method-override
app.use(methodOverride("_method"));
// use express-sanitizer
app.use(expressSanitizer());

// ***************************
// MONGO DATABASE SETUP
// ***************************

// connecting application to mongoDB
mongoose.connect('mongodb://localhost/frosty_data', {useNewUrlParser: true, useUnifiedTopology: true});

// console logging if connection is successful
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB Connected");
});


// ***************************
// ROUTES
// ***************************

//----------------------------
// .GET routes
//----------------------------


// landing page
app.get("/",(req, res) => {
    res.render("landing.ejs");
});

// posts index
app.get("/blogs",(req, res) => {
// get blogs from database 
    Blog.find({},(err, blogs) => {
        if(err){
            console.log("Error: Unable to retreive blog data.");
        } else {
            res.render("index.ejs", {blogs:blogs});
        }
    });
});


// new post form
app.get("/blogs/new",(req, res) => {
    res.render("newBlog.ejs");
});

// new comment form **I'm not making this on a separate page, this is embeded in the single post page**
/*app.get("/blogs/:id/comments/new",(req,res) => {
    res.send("NEW COMMENTS FORM GOES HERE");
});*/

// settings/general
app.get("/settings/general",(req, res) => {
    res.render("settings-general.ejs");
});

// settings>blogs
app.get("/settings/blogs",(req, res) => {
// get blogs from database 
    Blog.find({},(err, blogs) => {
        if(err){
            console.log("Error: Unable to retreive blog data.");
        } else {
            res.render("settings-blogs.ejs", {blogs:blogs});
        }
    });
});

// settings>blogs>:id>edit
app.get("/settings/blogs/:id/edit",(req, res) => {
     // find post with provided ID
    Blog.findById(req.params.id,(err, dbData) => {
        if(err){
            console.log("error finding blog data by ID");
        } else {
            // render single post template with that post data
            res.render("editBlog.ejs", {blog: dbData});
        }
    });
});

// render individual post. This is a wildcard link and must therefore be
// placed after static links in the application!
app.get("/blogs/:id",(req, res) => {
    // Find Blog by ID and populate comments
    Blog.findById(req.params.id).
    // populate comments
    populate("comments").
    exec((err, dbData) => {
        if(err){
            console.log("error finding blog data by ID");
        } else {
            // render single post template with that post data
            res.render("singleBlog.ejs", {blog: dbData});
            console.log("Article: " + dbData.title + " has loaded.");
        }
    });
});


//----------------------------
// .POST routes
//----------------------------

// new blog: receive and save
app.post("/blogs",(req, res) => {
    // sanitize inputs
    req.body.blog.title = req.sanitize(req.body.blog.title);
    req.body.blog.short = req.sanitize(req.body.blog.short);
    req.body.blog.content = req.sanitize(req.body.blog.content);
    // get data from form and add to blogs array
    Blog.create(req.body.blog,(err, newDatabaseRecord) => {
        if(err){
            console.log("Failed to write post to database.");
        } else {
            console.log("Blog successfully saved to database.");
            console.log(newDatabaseRecord);
            // redirect back to blogs page
             res.redirect("/blogs");
        }
    });
});

// new comment: receive and save to blog
app.post("/blogs/:id/comments",(req,res) => {
    // sanitize inputs
    req.body.comment.author = req.sanitize(req.body.comment.author);
    req.body.comment.content = req.sanitize(req.body.comment.content);
        
    async function saveComment() {
        try {
            // lookup blog using ID
            let blog = await Blog.findById(req.params.id);
            // create new comment
            let comment = await Comment.create(req.body.comment);
            // connect new comment to blog
            blog.comments.push(comment);
            blog.save();
            console.log("New Comment Saved");
            // redirect    
            res.redirect("/blogs/" + blog._id);
        } catch(err) {
            console.log(err);
        }
    }
    saveComment();
});    

 
//----------------------------
// .PUT routes
//----------------------------
// edit post
app.put("/blogs/:id",(req, res) => {
    // sanitize inputs
    req.body.blog.title = req.sanitize(req.body.blog.title);
    req.body.blog.short = req.sanitize(req.body.blog.short);
    req.body.blog.content = req.sanitize(req.body.blog.content);
    // find and update post
    Blog.findByIdAndUpdate(req.params.id, req.body.blog,(err, oldDatabaseRecord) => {
        if(err){
            console.log("Failed to update database");
        } else {
            console.log("Blog successfully updated in database.");
            // we want to log the UPDATED data, not the old
            Blog.findById(req.params.id, '_id image title author date short content' , { lean: true },(err, newDatabaseRecord) => {
                if(err){
                    console.log("Failed To Retreive Updated Record For Display");
                } else {
                    console.log(newDatabaseRecord);
                }
            });
            // redirect to updated single post page
            res.redirect("/blogs/" + req.params.id);
        }
    });
}); 

//----------------------------
// .DELETE routes
//----------------------------
// delete post
app.delete("/blogs/:id",(req, res) => {
    Blog.findByIdAndRemove(req.params.id,(err) => {
        if(err){
          console.log("failed to delete Mongo document");  
        } else {
            console.log("Blog with ID:" + req.params.id + " has been deleted");
            res.redirect("/settings/blogs");
        }
    });
})

// ***************************
// Command Reference
// ***************************

// Start MongoDB: sudo service mongod start
// Check MongoDB Status: service mongod status (in linux shell)