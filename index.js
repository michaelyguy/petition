const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const {
    insertSignature,
    getFirstAndLast,
    getSignatureById,
    insertUserInfo,
    getHashedPassword,
    getSignature,
} = require("./db.js");
const { hash, compare } = require("./bc.js");

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 24 * 14,
    })
);

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
    insertSignature(userInfo.signature, req.session.infoCookie.userId)
        .then((result) => {
            console.log("-------RESULTS-/petition--------");
            console.log(result);
            let signatureId = result.rows[0].id;
            (req.session.infoCookie.signatureId = signatureId),
                console.log("-------REQ.SESSION----");
            console.log(req.session);

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("ERROR IN POST /petition: ", err);
        });
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

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        // result: result.rows,
    });
});

app.post("/register", (req, res) => {
    const userInfo = req.body;
    console.log("-------USER INFO POST REGISTER-------");
    console.log(userInfo);
    hash(userInfo.password)
        .then((hashedPw) => {
            console.log("------HASEDPASSWORD-----");
            console.log(hashedPw);
            insertUserInfo(
                userInfo.firstName,
                userInfo.lastName,
                userInfo.email,
                hashedPw
            )
                .then((result) => {
                    req.session.infoCookie = {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        email: userInfo.email,
                        userId: result.rows[0].id,
                    };
                    console.log('----RESULT IN POST"/REGISTER"----');
                    console.log(result);
                    res.redirect("/petition");
                })
                .catch((err) => {
                    console.log("ERROR IN /REGISTER INFO", err);
                    res.render("register", {
                        layout: "main",
                        err: true,
                        // ADD ERROR IN HANDLEBARS //
                    });
                });
        })
        .catch((err) => {
            console.log("ERROR IN POST /register: ", err);
            res.sendStatus(500);
        });
});

app.get("/register", (req, res) => {
    res.render("register", {
        layout: "main",
        // result: result.rows,
    });
});

app.post("/login", (req, res) => {
    const userInfo = req.body;
    console.log("-------USER INFO POST /LOGIN-------");
    console.log(userInfo);
    const userPassword = userInfo.password;
    getHashedPassword(userInfo.email).then((result) => {
        console.log("------RESULT IN POST /LOGIN------");
        console.log(result);
        compare(userPassword, result.rows[0].password)
            .then((match) => {
                console.log("match:", match);
                console.log("password correct?", match);
                if (match == true) {
                    // (req.session.infoCookie.signatureId = signatureId),
                    // if match is true, you want to store the user is in the cookie
                    getSignature(result.rows[0].id).then((result) => {
                        console.log("----RESULT IN GETSIGNATURE-----");
                        console.log(result);
                    });
                } else {
                    res.render("login", {
                        layout: "main",
                        err: true,
                        // ADD ERROR IN HANDLEBARS //
                    });

                    // if password don't match render login with an error message
                    // if compare returned true: check if the user has signed the petition, if yes
                    // store this infor in a cookie and redirect to /thanks, if not redirect to /petition
                }
            })
            .catch((err) => {
                console.log("error in POST /login compare:", err);
                //you probably just want to render login with an error
                res.sendStatus(500);
            });
    });
});

app.listen(8080, () => {
    console.log("PETITION RUNING!");
});
