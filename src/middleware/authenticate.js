const jwt = require("jsonwebtoken");
const Register = require("../models/registers");
// function for a middleware in order to check whether the tokne is okay or not so that the protected routes can be accessed
async function authenticate(req, res, next) {
    try {
        const token = req.cookies.jwt;
        let isSuccess, message, status;
        if (!token) {
            isSuccess = false;
            message = "Token is missing!";
            status = 401;
            return res.status(status).json({
                isSuccess: isSuccess,
                message: message,
                status: status,
            });
        }
        const verifyuser = jwt.verify(
            token,
            "mynameisdeepakmaidasaniandiamindaiict"
        );
        const user = await Register.findOne({ _id: verifyuser._id });
        next();
    } catch (err) {
        res.status(401).send("Internal Server Error! Please try again");
    }
}
module.exports = authenticate;
