#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Category = require('./models/category')
var Item = require('./models/item')

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var categories = []

function categoryCreate(name, description, cb) {
    let category = new Category({name, description});

    category.save(function(err) {
        if(err) {
            cb(err, null);
            return;
        };

        console.log("New Category: " + category);
        categories.push(category);
        cb(null, category);
    })
}

function itemCreate(name, description, category, number_in_stock, price, cb) {
    let item = new Item({name, description, category, number_in_stock, price});

    item.save(function(err) {
            if(err) {
                cb(err, null);
                return;
            };
            console.log("Item created: " + item);
            cb(null, item);
        }
    );
};

function createCategories(cb) {
    async.series([
        function(callback) {
            categoryCreate("Burgers", "Best burgers in town!", callback)
        },
        function(callback) {
            categoryCreate("Pizzas", "All kinds of pizzas!", callback)
        },
        function(callback) {
            categoryCreate("Sweets", "Best deserts in town!", callback)
        },
        function(callback) {
            categoryCreate("Drinks", "All kinds of drinks!", callback);
        },
    ],
    //Optional cb
    cb);
};

function createItems(cb) {
    async.parallel([
        function(callback){
            itemCreate("Hamburger", "The most basic hamburger", categories[0], 10, 2.5, callback)
        },
        function(callback){
            itemCreate("Cheeseburger", "Hamburger with cheese instead of meat...", categories[0], 10, 2, callback)
        },
        function(callback){
            itemCreate("Chickenburger", "It doesn't come with an egg", categories[0], 10, 2.2, callback)
        },
        function(callback){
            itemCreate("Veggieburger", "Burger made of vegetables mmm", categories[0], 10, 1.8, callback)
        },
        function(callback){
            itemCreate("Capricciosa", "The most basic pizza", categories[1], 20, 2, callback)
        },
        function(callback){
            itemCreate("Neapolitana", "Pizza from Napoli", categories[1], 20, 2.5, callback)
        },
        function(callback){
            itemCreate("Quatrro stagioni", "A year old pizza", categories[1], 20, 3.2, callback)
        },
        function(callback){
            itemCreate("Vegetariana", "Pizza made of vegetables mmm", categories[1], 20, 2, callback)
        },
        function(callback){
            itemCreate("Cake", "Regular cake", categories[2], 20, 1.5, callback)
        },
        function(callback){
            itemCreate("Pancake", "Nice pancake", categories[2], 20, 1.2, callback)
        },
        function(callback){
            itemCreate("Ice cream", "Very nice ice cream", categories[2], 20, 1.3, callback)
        },
        function(callback){
            itemCreate("Brownie", "It's just a brownie", categories[2], 20, 1, callback)
        },
        function(callback){
            itemCreate("Water", "The most basic water...", categories[3], 20, 0.5, callback)
        },
        function(callback){
            itemCreate("Beer", "Cold beer", categories[3], 20, 1.2, callback)
        },
        function(callback){
            itemCreate("Juice", "The most basic juice...", categories[3], 20, 1, callback)
        },
        function(callback){
            itemCreate("Coffee", "Hot coffee", categories[3], 20, 0.8, callback)
        },
    ],
    cb);
};

async.series([
    createCategories,
    createItems,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('Categories: '+categories);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});