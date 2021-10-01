const express = require("express");

require("dotenv").config();
const app = express();
const hbs = require("hbs");
const mongoose = require("mongoose");
const path = require("path");
const cookieparser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const authenticate = require("./middleware/authenticate");
require("./db/conn.js");
//session
var session = require("express-session");
app.use(
    session({
        secret: "asdfghjklmnbvccxzasqer",
        resave: false,
        saveUninitialized: false,
    })
);

const port = process.env.PORT || 8000;

const partialspath = path.join(__dirname, "../src/partials");

const Register = require("./models/registers.js");

//app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const publicpath = path.join(__dirname, "../public");

app.use(express.static(publicpath));

app.set("view engine", "hbs"); //setting view engine

hbs.registerPartials(partialspath);

app.use(cookieparser());

//routing
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    try {
        const password = req.body.password;
        const confirm_password = req.body.cpassword;
        if (password === confirm_password) {
            const registerEmployee = new Register({
                email: req.body.email,
                password: req.body.password,
            });
            const token = await registerEmployee.generateAuthToken();
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 1000000),
                httpOnly: true,
                // secure:true   --uncomment this while production--
            });
            const registered = await registerEmployee.save();

            res.status(201).render("index");
        } else {
            res.status(400).redirect("register");
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get("/login", (req, res) => {
    console.log(req.session);
    if (req.session.email) {
        res.redirect("home");
    } else {
        res.render("login");
    }
});

// login validation
app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password; // converting string to number
        const userrecord = await Register.findOne({ email: email });
        // res.send(userrecord);
        if (!userrecord) {
            res.status(404).redirect("/register");
        }
        if (password === userrecord.password) {
            sess = req.session;
            sess.name = userrecord.firstname;
            sess.email = userrecord.email;
            const token = await userrecord.generateAuthToken();
            console.log("token is:" + token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 100000),
                httpOnly: true,
                // secure:true   --uncomment this while production--
            });
            res.status(201).redirect("home");
        } else {
            //res.send("password are not matching");
            res.redirect("/login");
        }
    } catch (error) {
        res.status(400).redirect("/login");
    }
});

app.get("/home", authenticate, (req, res) => {
    if (req.session.email) {
        res.render("home", {
            user: req.session.name,
            email: req.session.email,
        });
        console.log(`the cookie is : ${req.cookies.jwt}`);
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", async (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/login");
    });
});

app.listen(port, () => {
    console.log(`server is running at ${port}`);
});
