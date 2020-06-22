const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const {
    insertSignature,
    getSignatureById,
    insertUserInfo,
    getHashedPassword,
    getSignature,
    insertProfileInfo,
    getSingersInfo,
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

app.use(express.urlencoded({ extended: false }));
app.use(csurf());

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
            req.session.infoCookie.signatureId = signatureId;
            console.log("--------REQ.SESSION-----");
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
    getSingersInfo()
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
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("ERROR IN /REGISTER INFO", err);
                    res.render("register", {
                        layout: "main",
                        error: true,
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
    });
});

app.post("/login", (req, res) => {
    const userInfo = req.body;
    console.log("-------USER INFO POST /LOGIN-------");
    console.log(userInfo);
    const userPassword = userInfo.password;
    getHashedPassword(userInfo.email).then((result) => {
        console.log("-----RESULT IN POST /LOGIN-----");
        console.log(result);
        if (result.rows.length <= 0) {
            res.redirect("/register");
        } else {
            console.log("------RESULT IN POST /LOGIN------");
            console.log(result);
            compare(userPassword, result.rows[0].password)
                .then((match) => {
                    console.log("password correct?", match);
                    if (match == true) {
                        getSignature(result.rows[0].id).then((result) => {
                            if (result.rows.length > 0) {
                                req.session.infoCookie.signatureId =
                                    result.rows[0].id;
                                console.log("-----MY COOKIE-----");
                                console.log(req.session.infoCookie);
                                console.log(
                                    "------RESULT IN GETSIGNATURE-----"
                                );
                                console.log(result);
                                res.redirect("/thanks");
                            } else {
                                res.redirect("/petition");
                            }
                        });
                    } else {
                        res.render("login", {
                            layout: "main",
                            error: true,
                        });
                    }
                })
                .catch((err) => {
                    console.log("error in POST /login compare:", err);
                    res.render("login", {
                        layout: "main",
                        error: true,
                    });
                });
        }
    });
});

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", (req, res) => {
    const userInfo = req.body;
    console.log("-------USER INFO POST /PROFILE-------");
    console.log(userInfo);
    insertProfileInfo(
        userInfo.age,
        userInfo.city,
        userInfo.homePage,
        req.session.infoCookie.userId
    ).then((result) => {
        console.log("----------RESULT IN POST /PROFILE----------");
        console.log(result);
    });
});

app.get("/signers/:city", (req, res) => {
    console.log("------REQ.PARAMS------");
    console.log(req.params);
    res.render("signers-by-city", {
        layout: "main",
    });
});

app.listen(process.env.PORT || 8080, () => {
    console.log("PETITION RUNING!");
});
