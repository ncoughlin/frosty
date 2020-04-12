
// ***************************
// EXPRESS SETUP
// ***************************

console.log("app.js is connected");

// import modules
const express          = require('express'),
      app              = express(),
      bodyParser       = require('body-parser'),
      mongoose         = require('mongoose'),
      methodOverride   = require('method-override'),
      expressSanitizer = require('express-sanitizer'),
      passport         = require('passport'),
      LocalStrategy    = require('passport-local'),
      flash            = require('connect-flash'),
      Blog             = require('./models/blogs'),
      Comment          = require('./models/comments'),
      User             = require('./models/users'),
      seedDB           = require('./seeds'),
      moment           = require('moment');

//import comment routes
const commentRoutes    = require("./routes/comments"),
      blogRoutes       = require("./routes/blogs"),
      settingRoutes    = require("./routes/settings"),
      userRoutes       = require("./routes/users"),
      indexRoutes      = require("./routes/index");

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
// use flash
app.use(flash()); 

// ***************************
// MONGO CONFIGURATION
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
// MOMENT
// ***************************

app.locals.moment = require('moment');

// ***************************
// PASSPORT CONFIGURATION
// ***************************

app.use(require("express-session")({
    secret: "Never play anything the same way twice.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// the following User.methods are provided by
// plugin(passportLocalMongoose) in the users.js model module
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ***************************
// ROUTE CONFIGURATION
// ***************************

app.use("/blogs", blogRoutes);
app.use("/blogs/:id/comments", commentRoutes);
app.use("/users", userRoutes);
app.use("/settings", settingRoutes);
app.use(indexRoutes);

// ***************************
// DATABASE SEEDING
// ***************************
// disable to prevent seeding of database
// seedDB();



// ***************************
// GLOBAL VARIABLES
// ***************************

// pass through user data on every route
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});




// ***************************
// Command Reference
// ***************************

// Start MongoDB: sudo service mongod start
// Check MongoDB Status: service mongod status (in linux shell)