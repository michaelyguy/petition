const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const {
    insertSignature,
    getFirstAndLast,
    getSignatureById,
    getAllData,
} = require("./db.js");
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
    res.redirect("/register");
});

app.get("/petition", (req, res) => {
    const infoCookie = req.session;
    res.render("home", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    const userInfo = req.body;
    console.log("-------USER INFO-------");
    console.log(userInfo);
    insertSignature(userInfo.firstName, userInfo.lastName, userInfo.signature)
        .then((result) => {
            console.log("-------RESULTS-/petition--------");
            console.log(result);
            let userId = result.rows[0].id;
            req.session.infoCookie = {
                firstName: userInfo.firstName,
                lastName: userInfo.lastName,
                signatureId: userId,
            };
            console.log("-------REQ.SESSION----");
            console.log(req.session);

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("ERROR IN POST /petition: ", err);
        });
    // getAllData().then((result) => {
    //     console.log("------RESULT ALL DATA=-----");

    //     console.log(result);
    // });
});

app.get("/thanks", (req, res) => {
    getSignatureById(req.session.infoCookie.signatureId).then((result) => {
        console.log("-----RESULT /THANKS GET-----");
        console.log(result);
        res.render("thanks", {
            layout: "main",
            infoCookie: result.rows[0],
        });
    });
});

app.get("/signers", (req, res) => {
    getFirstAndLast()
        .then((result) => {
            console.log("-------RESULTS-/signers--------");
            console.log(result);
            res.render("signers", {
                layout: "main",
                result: result.rows,
            });
        })
        .catch((err) => {
            console.log("ERROR IN GET /signers: ", err);
        });
});

// FOR PART 3 ////

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        // result: result.rows,
    });
});

app.post("/login", (req, res) => {});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
        // result: result.rows,
    });
});

app.post("/register", (req, res) => {
    const userInfo = req.body;
    console.log("-------USER INFO POST REGISTER-------");
    console.log(userInfo);
    // you will get all sorts of user info: like first, last, email and desired password in
    // clear Text, all this information will be in req.body
    // you will want to call hash, pass it the user's password (i.e. req.body.password),
    // and salt&hash it before you store the user's info in the database
    // in class we are hardcoding the user's password input DO NOT DO THIS when you
    // are implementing this feature
    // hash("userInput")
    //     .then((hashedPw) => {
    //         console.log("hashed userInput/password:", hashedPw);
    // this is where we will want to make an insert into our database with all this
    // user information, if something goes wrong in our insert of user information
    // render register with an error msg, if everything goes right, redirect them to
    // the petition page
    // res.sendStatus(200);
    // })
    // .catch((err) => {
    //     console.log("error in POST /register:", err);
    //     res.sendStatus(500);
    // you will want to render register with an error message
    // });
});

app.listen(8080, () => {
    console.log("PETITION RUNING!");
});
