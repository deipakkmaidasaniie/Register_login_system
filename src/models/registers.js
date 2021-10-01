const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const empSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            },
        },
    ],
});

empSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign(
            { _id: this._id.toString() },
            port.env.USER_ACCESS_KEY
        );
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (err) {
        console.log(err);
    }
};
const Register = new mongoose.model("Register", empSchema);

module.exports = Register;
