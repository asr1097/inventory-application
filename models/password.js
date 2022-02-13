const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const passwordSchema = new Schema(
    {
        password: {type: String, required: true, maxlength: 100, minlength: 1},
    }
);

module.exports = mongoose.model("Password", passwordSchema);