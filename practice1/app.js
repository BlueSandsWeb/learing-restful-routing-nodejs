var express         = require("express"),
    app             = express(),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    faker           = require("faker"),
    methodOverride  = require("method-override");
    

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_practice_1"); // createse and connects to db
app.set("view engine", "ejs");                              // sets ejs as default file type
app.use(express.static("public"));                          // sets where css files are located
app.use(bodyParser.urlencoded({extended: true}));           // sets up body-parser
app.use(methodOverride("_method"));                         // enables PUT and DELETE routing
app.use(expressSanitizer());
//app.use('/medium-editor', express.static(__dirname + '/node_modules/medium-editor')); // fix location.  It's not showing up when searched for

// Faux Data

var rProductName = faker.commerce.productName;
var rProductImage = faker.image.food;
var rProductDescription = faker.lorem.sentences;
var rProductPrice = faker.commerce.price;

// SCHEMAs

var storeSchema = new mongoose.Schema({
    product: String,
    image: String,
    description: String,
    price: String
});
var Store = mongoose.model("Store", storeSchema);

// Create Dummy Data

// for(var i = 0; i < 30; i++){
//     Store.create({
//         product: rProductName(),
//         image: rProductImage(),
//         description: rProductDescription(),
//         price: rProductPrice()
//     })
// }


// ***** ROUTES ****** //

app.get("/", function(req, res){
   res.redirect("/index"); 
});

// INDEX ROUTE
app.get("/index", function(req, res){
    Store.find({}, function(err, products){
       if(err){
           console.log(err)
       } else {
           res.render("index", {products: products})
       }
    });
});

// NEW ROUTE
app.get("/index/new", function(req, res){
   res.render("new"); 
});

// CREATE ROUTE
app.post("/index", function(req, res){
    console.log(req.body);
    req.body.store.description = req.sanitize(req.body.store.description);
    console.log("===============================================");
    console.log(req.body);
    // create new food item
    Store.create(req.body.store, function(err, newfood){
        if(err){
            res.render("new");
        } else {
            // redirect to index page
            res.redirect("/index");
        }
    });

});

// SHOW ROUTE
app.get("/index/:id", function(req, res){
    Store.findById(req.params.id, function(err, foundFood){
        if(err){
            res.redirect("/index");
        } else {
            res.render("show", {food: foundFood});
        }
    });
})

// EDIT ROUTE
app.get("/index/:id/edit", function(req, res){
    Store.findById(req.params.id, function(err, foundProduct){
        if(err){
            res.redirect("/index");
        } else{
            res.render("edit", {product: foundProduct});
        }
    })
})


// UPDATE ROUTE
app.put("/index/:id", function(req, res){
    req.body.store.description = req.sanitize(req.body.store.description);      // sanitize user input
    Store.findByIdAndUpdate(req.params.id, req.body.store, function(err, updatedBlog){
        if(err){
            console.log(err);
        } else {
            res.redirect("/index/" + req.params.id);
        }
    });
});


// DESTROY ROUTE
app.delete("/index/:id", function(req, res){
   // destroy product
   Store.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/index/" + req.params.id);
      } else {
         //redirect back to index
          res.redirect("/index");
      }
   });
});

//Server Startup
app.listen(process.env.PORT  || 3000, process.env.IP || "LOCALHOST", function(){
    console.log("Blog Server Running!");
})