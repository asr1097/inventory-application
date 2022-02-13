const Category = require("../models/category");
const Items = require("../models/item");
const Password = require("../models/password");
const { check, body, validationResult } = require("express-validator");
const async = require("async")

exports.menu_get = function(req, res, next) {
    Category.find().exec(function(err, categories) {
        if(err) {return next(err);}
        res.render("menu", {categories});
    });
};

exports.category_create_get = function(req, res, next) {
    res.render("category_form", {category: null, errors: null});
};

exports.category_create_post = [
    body("name", "Category must have a name.").trim().isLength({min: 1}).escape(),
    body("description", "Category must have a description.").trim().isLength({min: 1}).escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        const category = new Category(
            {
                name: req.body.name,
                description: req.body.description
            }
        );
        if(!errors.isEmpty()) {
            res.render("category_form", {category, errors})
        } else {
            category.save(function(err) {
                if(err) {return next(err);}
                res.redirect("/");
            })
        }
    }
];

exports.category_update_get = function(req, res, next) {
    Category.findById(req.params.category, function(err, category) {
        if(err) {return next(err);}
        res.render("category_form", {category, errors: null})
    });
};

exports.category_update_post = [
    body("name", "Category must have a name.").trim().isLength({min: 1}).escape(),
    body("description", "Category must have a description.").trim().isLength({min: 1}).escape(),
    check("password").custom(async value => {
        let result =  await Password.findOne({});
        console.log(result)
        if(value !== result.password){return Promise.reject()}
        else{return Promise.resolve()};}).withMessage("Incorrect password."),

    async (req, res, next) => {
        const errors = await validationResult(req);
        const category = new Category(
            {
                name: req.body.name,
                description: req.body.description,
                _id: req.params.category
            }
        );
        if(!errors.isEmpty()) {
            res.render("category_form", {category, errors: errors.array()})
        } else {
            Category.findByIdAndUpdate(req.params.category, category, {}, function(err, thecategory) {
                if(err) {return next(err);}
                res.redirect("/");
            })
        }
    }

]

exports.category_delete_get = function(req, res, next) {
    res.render("category_delete", {errors: null});
};

exports.category_delete_post = [
    check("password").custom(async value => {
        let result =  await Password.findOne({});
        console.log(result)
        if(value !== result.password){return Promise.reject()}
        else{return Promise.resolve()};}).withMessage("Incorrect password."),

    async (req, res, next) => {
        const errors = await validationResult(req);
        if(!errors.isEmpty()) {
            res.render("category_delete", {errors: errors.array()})
        } else{next()}
    },

    function (req, res, next) {
        async.parallel(
            {
                items: function(callback) {
                    Items.deleteMany({"category": req.params.category}).exec(callback)
                },

                category: function(callback) {
                    Category.findByIdAndRemove(req.params.category).exec(callback)
                }
            }, function(err, results) {
                if(err) {return next(err);}
                res.redirect("/");
            }
        )
    }
]


