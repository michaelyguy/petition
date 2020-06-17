const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const { insertSignature, getFirstAndLast } = require("./db.js");

//// NOT SURE WHAT THIS IS DOING ////
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

//// MIDDLEWARE ////
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 24 * 14,
    })
);
//// CSS, CANVAS, PHOTOS /////
app.use(express.static("./public"));
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    const permission = req.session.permission;
    if (permission) {
        res.redirect("/thanks");
    } else {
        res.render("home", {
            layout: "main",
        });
    }
});

app.post("/petition", (req, res) => {
    console.log("req.session before values set:", req.session);
    req.session.permission = true;
    console.log("req.ssesion after value set: ", req.session);
    const userInfo = req.body;
    console.log(userInfo);

    res.redirect("/thanks");
    insertSignature(
        userInfo[first - name],
        userInfo[last - name],
        userInfo.signature
    );
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    res.render("signers", {
        layout: "main",
    });
});

app.listen(8080, () => {
    console.log("PETITION RUNING!");
});
