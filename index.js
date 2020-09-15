//// THINGS TO FIX ////
//// TO ADD ERROR <P> IN MY FREE TIME LATER ////
//// PPL CAN REG WITHOUT PASSWORD //////
//// ADD LOGOUT - OOOPS /////

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
    getSignatureIdByUserId,
    insertProfileInfo,
    getSignersInfo,
    getSignersByCity,
    getInfoForEdit,
    updateThreeColumns,
    updateFourColumns,
    upsertUserProfile,
    deleteSig,
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
    insertSignature(userInfo.signature, req.session.infoCookie.userId)
        .then((result) => {
            let signatureId = result.rows[0].id;
            req.session.infoCookie.signatureId = signatureId;
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("errro in post/petition: ", err);
        });
});

app.get("/thanks", (req, res) => {
    getSignatureById(req.session.infoCookie.signatureId).then((result) => {
        res.render("thanks", {
            layout: "main",
            result: result.rows[0],
            fullname: req.session.infoCookie,
        });
    });
});

app.post("/thanks", (req, res) => {
    deleteSig(req.session.infoCookie.signatureId).then((result) => {
        res.redirect("/petition");
    });
});

app.get("/signers", (req, res) => {
    getSignersInfo()
        .then((result) => {
            res.render("signers", {
                layout: "main",
                result: result.rows,
            });
        })
        .catch((err) => {
            console.log("error in get/signers: ", err);
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    const userInfo = req.body;
    hash(userInfo.password)
        .then((hashedPw) => {
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
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("error in post/register: ", err);
                    res.render("register", {
                        layout: "main",
                        error: true,
                    });
                });
        })
        .catch((err) => {
            console.log("error in post/register: ", err);
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
    const userPassword = userInfo.password;
    getHashedPassword(userInfo.email).then((result) => {
        if (result.rows.length <= 0) {
            res.redirect("/register");
        } else {
            compare(userPassword, result.rows[0].password)
                .then((match) => {
                    if (match == true) {
                        req.session.infoCookie = {};
                        req.session.infoCookie.userId = result.rows[0].id;
                        req.session.infoCookie.firstName = result.rows[0].first;
                        req.session.infoCookie.lastName = result.rows[0].last;
                        getSignatureIdByUserId(result.rows[0].id).then(
                            (result) => {
                                if (result.rows.length > 0) {
                                    req.session.infoCookie.signatureId =
                                        result.rows[0].id;
                                    res.redirect("/thanks");
                                } else {
                                    res.redirect("/petition");
                                }
                            }
                        );
                    } else {
                        res.render("login", {
                            layout: "main",
                            error: true,
                        });
                    }
                })
                .catch((err) => {
                    console.log("error in post/login: ", err);
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
    if (
        userInfo.homePage &&
        !userInfo.homePage.startsWith("https://") &&
        !userInfo.homePage.startsWith("http://")
    ) {
        userInfo.homePage = `https://${userInfo.homePage}`;
    }
    insertProfileInfo(
        userInfo.age,
        userInfo.city,
        userInfo.homePage,
        req.session.infoCookie.userId
    )
        .then((result) => {})
        .catch((err) => {
            console.log("error in post/profile: ", err);
        });
    res.redirect("/petition");
});

app.get("/signers-:city", (req, res) => {
    getSignersByCity(req.params.city)
        .then((result) => {
            res.render("signers-by-city", {
                layout: "main",
                city: req.params.city,
                signers: result.rows,
            });
        })
        .catch((err) => {
            console.log("error in get/signers/city: ", err);
        });
});

app.get("/profile-edit", (req, res) => {
    if (req.session.infoCookie.userId) {
        getInfoForEdit(req.session.infoCookie.userId).then((result) => {
            res.render("profile-edit", {
                layout: "main",
                profileInfo: result.rows,
            });
        });
    } else {
        console.log("byebyebyebeyb");
    }
});

app.post("/profile-edit", (req, res) => {
    const userInfo = req.body;
    if (userInfo.password == "") {
        updateThreeColumns(
            userInfo.firstName,
            userInfo.lastName,
            userInfo.email,
            req.session.infoCookie.userId
        )
            .then((result) => {})
            .catch((err) => {
                console.log("error in post/profile/edit: ", err);
            });
    } else {
        updateFourColumns(
            userInfo.firstName,
            userInfo.lastName,
            userInfo.email,
            userInfo.password,
            req.session.infoCookie.userId
        ).then((result) => {
            hash(result.rows[0].password).then((hashedPw) => {});
        });
    }

    upsertUserProfile(
        userInfo.age,
        userInfo.city,
        userInfo.homePage,
        req.session.infoCookie.userId
    )
        .then((result) => {})
        .catch((err) => {
            console.log("ERROR IN UPSERT: ", err);
        });
    res.redirect("/thanks");
});

app.listen(process.env.PORT || 8080, () => {
    console.log("PETITION RUNING!");
});
