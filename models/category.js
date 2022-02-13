const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
    {
        name: {type: String, required: true, maxlength: 100, minlength: 1},
        description: {type: String, required: true, maxlength: 100, minlength: 1}
    }
);

categorySchema
    .virtual("url")
    .get(function() {
        return "/menu/" + this._id;
});

module.exports = mongoose.model("Category", categorySchema);