// MongoDB Schema for Posts
var postSchema = new mongoose.Schema({
    image: String,
    title: String,
    author: String,
    content: String
});

// creating schema variable named Post to be called later
// IE Post.find() or Post.create()
var Post = mongoose.model("Post", postSchema);