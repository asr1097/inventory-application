const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema(
    {
        name: {type: String, required: true, maxlength: 100, minlength: 1},
        description: {type: String, required: true, maxlength: 100, minlength: 1},
        category: {type: Schema.Types.ObjectId, ref: "Category", required: true},
        number_in_stock: {type: Number, required: true, min: 0},
        price: {type: Number, required: true, min: 0}
    }
);

itemSchema
    .virtual("url")
    .get(function() {
        return "/menu/" + this.category._id + "/" + this._id;
    })

module.exports = mongoose.model("Item", itemSchema);