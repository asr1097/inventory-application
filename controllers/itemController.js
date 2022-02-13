const { check, body, validationResult } = require("express-validator");
const Items = require("../models/item");
const Category = require("../models/category");
const Password = require("../models/password");
const async = require("async");
const fs = require("fs");
const path = require("path");

exports.items_get = function(req, res, next) {
    async.parallel({
        items: function(callback) {
            Items.find({category: req.params.category})
            .exec(callback)
        },

        category: function(callback) {
            Category.findById(req.params.category).exec(callback)
        }
    }, function(err, results) {
        if(err) {return next(err);}
        res.render("items", {items: results.items, category: results.category})
    });
};

exports.item_get = function(req, res, next) {
    Items.findById(req.params.item).exec(function(err, item){
        if(err) {next(err);}
        let file = "/images/";
        if(fs.existsSync(path.join(__dirname, "/../public/images/" + item.name + ".png"))){file += item.name + ".png"}
        else{file += "dummy.png"};
        res.render("item", {item, file});
    });
};

exports.item_create_get = function(req, res, next) {
   Category.find().exec(function(err, categories) {
       if(err) {return next(err);}
       res.render("item_form", {title: "Create new item", categories, item: null, file: null, errors: null});
   });
};

exports.item_create_post = [
    body("name", "Item must have a name").trim().isLength({min: 1}).escape(),
    body("description", "Item must have a description").trim().isLength({min: 1}).escape(),
    body("category").escape(),
    body("price").isFloat({min: 0}),
    body("number_in_stock").isFloat({min :0}),
    check("file").custom((value, {req}) => {
        if(req.file.mimetype === 'image/png'){
            return 'ok'; // return "non-falsy" value to indicate valid data"
        }else{
            return false; // return "falsy" value to indicate invalid data
        }
    }).withMessage('Please only submit png format.') // custom error message that will be send back if the file in not a png. 
    .custom((value, {req}) => {
        if(req.file.size < 3000000){
            return "size ok";
        } else{
            return false;
        }
    }).withMessage("File size max: 3MB"),

    (req, res, next) => {
        const errors = validationResult(req);
        const item = new Items(
            {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                price: req.body.price,
                number_in_stock: req.body.number_in_stock
            }
        );
        if(!errors.isEmpty()) {
            Category.find().exec(function(err, categories) {
                if(err) {return next(err);}
                console.log(errors.array())
                res.render("item_form", {title: "Create new item", categories, item, file: null, errors: errors.array()});
            })
        } else {
            item.save(function(err) {
                if(err) {return next(err);}
                res.redirect("/menu/" + req.body.category)
            })
        };
    },
];

exports.item_update_get = function(req, res, next) {
    async.parallel(
        {
            categories: function(callback) {
                Category.find().exec(callback)
            },

            item: function(callback) {
                Items.findById(req.params.item).exec(callback)
            }
        }, function(err, results) {
            if(err) {return next(err);}
            res.render("item_form", {title: "Update item", categories: results.categories, item: results.item, file: null, errors: null})
        }
    )
};

exports.item_update_post = [
    body("name", "Item must have a name").trim().isLength({min: 1}).escape(),
    body("description", "Item must have a description").trim().isLength({min: 1}).escape(),
    body("category").escape(),
    body("price").isFloat({min: 0}),
    body("number_in_stock").isFloat({min :0}),
    check("password").custom(async value => {
        let result =  await Password.findOne({});
        console.log(result)
        if(value !== result.password){return Promise.reject()}
        else{return Promise.resolve()};}).withMessage("Incorrect password."),
    check("file").custom((value, {req}) => {
        if(!req.file){return 'ok'}
        if(req.file.mimetype === 'image/png'){
            return 'ok'; // return "non-falsy" value to indicate valid data"
        }
        else{
            return false; // return "falsy" value to indicate invalid data
        }
    }).withMessage('Please only submit png format.') // custom error message that will be send back if the file in not a png. 
    .custom((value, {req}) => {
        if(!req.file){return "ok"}
        if(req.file.size < 3000000){
            return "size ok";
        } 
        else{
            return false;
        }
    }).withMessage("File size max: 3MB"),

    async (req, res, next) => {
        const errors = await validationResult(req);
        const item = new Items(
            {
                name: req.body.name,
                description: req.body.description,
                category: req.body.category,
                price: req.body.price,
                number_in_stock: req.body.number_in_stock,
                _id: req.params.item
            }
        );

        if(!errors.isEmpty()) {
            Category.find().exec(function(err, categories) {
                if(err) {return next(err);}
                res.render("item_form", {title: "Update item", categories, item, file: null, errors: errors.array()})
            })
        } else {
            Items.findByIdAndUpdate(req.params.item, item, {}, function(err, theitem) {
                if(err) {return next(err);}
                res.redirect(theitem.url)
            });
        };
    }
];

exports.item_delete_get = function(req, res, next) {
    res.render("item_delete", {errors: null});
};

exports.item_delete_post = [
    check("password").custom(async value => {
        let result =  await Password.findOne({});
        console.log(result)
        if(value !== result.password){return Promise.reject()}
        else{return Promise.resolve()};}).withMessage("Incorrect password."),

    async function(req, res, next) {
        const errors = await validationResult(req);
        if(!errors.isEmpty()) {
            console.log(errors.array())
            res.render("item_delete", {errors: errors.array()});
        } else {
            Items.findById(req.params.item).exec(function(err, item){
                if(err){return next(err);}
                Items.findByIdAndRemove(req.params.item).exec(function(err) {
                    if(err) {return next(err);}
                    let filePath = path.join(__dirname, `/../public/images/${item.name}.png`);
                    let file = fs.existsSync(filePath);
                    if(file){fs.unlink(filePath, err => {
                        if(err){return next(err)}
                        res.redirect("/menu/" + req.params.category);
                    })} else{res.redirect("/menu/" + req.params.category);};
                });
            });
        };
    }
]