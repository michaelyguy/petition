const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { insertSignature, getFirstAndLast, signatureId } = require("./db.js");
// const { hash, compare } = require("./bc.js");

//// NOT SURE WHAT THIS IS DOING ////
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

//// MIDDLEWARES ////
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 24 * 14,
    })
);

//// CSS, CANVAS, PHOTOS /////
app.use(express.static("./public"));

//// PROTECTING THE SITE ////
app.use(express.urlencoded({ extended: false }));
app.use(csurf());

//// PROTECTING ALL HIDDEN FOARMS ////
app.use(function (req, res, next) {
    res.setHeader("X-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});

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
    req.session.permission = true;
    const userInfo = req.body;

    console.log("-------USER INFO-------");
    console.log(userInfo);

    insertSignature(userInfo.firstName, userInfo.lastName, userInfo.signature)
        .then((result) => {
            console.log("-------RESULTS-/petition--------");
            console.log(result);
            // let userId = result.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("ERROR IN POST /petition: ", err);
        });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main",
        emojis: ["🦆", "🐢", "🍆", "🍄", "🦔"],
        userInfo,
    });
});

app.get("/signers", (req, res) => {
    getFirstAndLast()
        .then((result) => {
            console.log("-------RESULTS-/signers--------");
            console.log(result);
            res.render("signers", {
                layout: "main",
                userinfo: {
                    // req.body.
                },
                // userInfo.firstName,
                // userInfo.lastName
            });
        })
        .catch((err) => {
            console.log("ERROR IN GET /signers: ", err);
        });
});

//// FOR PART 3 ////

// app.get("/login", (req, res) => {
//     res.render("login, {}");
// });

// app.get("/register", (req, res) => {
//     res.render("register, {}");
// });

// app.post("/register", (req, res) => {});

app.listen(8080, () => {
    console.log("PETITION RUNING!");
});
