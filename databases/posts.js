// import mongoose
var mongoose = require("mongoose");

// connecting application to mongoDB
mongoose.connect('mongodb://localhost/frosty_posts', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect('mongodb://localhost/frosty_settings', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect('mongodb://localhost/frosty_users', {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("MongoDB Connected");
});

// MongoDB Schema for Posts
var postSchema = new mongoose.Schema({
    image: String,
    title: String,
    author: String,
    content: String
});

// creating schema Model named Post to be called later
// IE Post.find() or Post.create()
// Compiling the model is what allows us to run these Mongoose methods
var Post = mongoose.model("Post", postSchema);

// *********************************************************************************
// TESTING AREA: Sending Data to the Database with .save and create Mongoose methods
// *********************************************************************************

// adding a post to the DB, first we create the data and put it into an object

//var post1 = new Post({
//    image: "https://ncoughlin.com/wp-content/uploads/2020/01/F4BB34AF-6E6F-4203-A1F0-321F9319A962_1_105_c.jpeg",
//    title: "First Post in MongoDB",
//    author: "Nick Coughlin",
//    content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo."
//});

// then we save that object to the database, and add some console feedback

//post1.save(function(err, post){
//    if(err){
//        console.log("Failed to write post to database.")
//    } else {
//        console.log("Post successfully saved to database.")
//        console.log(post);
//    }
//});

// adding a post to the DB in one go with the .create() method
Post.create({
    image: "https://ncoughlin.com/wp-content/uploads/2020/01/F4BB34AF-6E6F-4203-A1F0-321F9319A962_1_105_c.jpeg",
    title: "Training Capybaras",
    author: "Steve Buscemi",
    content: "Always remember to bring a bag of lettuce."
}, function(err, post){
    if(err){
        console.log("Failed to write post to database.");
    } else {
        console.log("Post successfully saved to database.");
        console.log(post);
    }
});

// *********************************************************************************
// TESTING AREA: End of Testing Area
// *********************************************************************************