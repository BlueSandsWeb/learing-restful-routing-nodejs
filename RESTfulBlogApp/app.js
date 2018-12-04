var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride  = require("method-override"),
    mongoose        = require("mongoose");


// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.set("view engine", "ejs");              // makes ejs the default file type looked for
app.use(express.static("public"));          // custom style sheets are located within public directory
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());                // this MUST go AFTER bodyParser if you're going to use it
app.use(methodOverride("_method"));

// ----- SCHEMA's ----- //

var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    Created: {type: Date, default: Date.now}    // this says that there should be a default date and that it should be Date.now
});
var Blog = mongoose.model("Blog", blogSchema);  

// Blog.create({
//     title: "testBlog",
//     image: "https://images.unsplash.com/photo-1507034589631-9433cc6bc453?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=266b96f7a75b99ba8180666166205ebc&auto=format&fit=crop&w=500&q=60",
//     body: "Hello this is a blog post!"
// })

// ----- RESTFUL ROUTES ----- //

app.get("/", function(req, res){
   res.redirect("/blogs"); 
});

// INDEX ROUTE
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err)
        } else {
            res.render("index", {blogs: blogs});
        }
    });
})

// NEW ROUTE
app.get("/blogs/new", function(req, res){
    res.render("new");
})

// CREATE ROUTE
app.post("/blogs", function(req, res){
    //create blog
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body)     // request.body.blog(The blog object in the new blog post form).body(look at new.ejs it is the body section of the form)
    console.log("======================");
    console.log(req.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else {
            //then redirect
            res.redirect("/blogs");
        }
    })

})

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body)       // this will sanitize the html input of the description section of the update
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){         //app.delete is just the name (it could be a GET request or a POST request and it would still work)
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/blogs/" + req.params.id);
       } else {
           res.redirect("/blogs");
       }
    });
    // redirect somewhere
});


// 404 ROUTE
app.get("*", function(req, res){
  res.render("404");
});

app.listen(process.env.PORT || 3000, process.env.IP || "LOCALHOST", function(){
    console.log("blog server running!");
})