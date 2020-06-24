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
//// EXAMPLE FROM CLASS /////
//// CHECK THIS /////
// app.use(function (req, res, next) {
//     if (
//         !req.session.infoCookie.userId &&
//         req.url != "/register" &&
//         req.url != "/login"
//     ) {
//         res.redirect("/register");
//     } else {
//         next();
//     }
// });
//// THIS MIDDLEWARE WILL RUN ONLY ON ROUTE THAT BEGIN WITH AUTH ////
// app.use("/auth", function (req, res, next) {
//     if (!req.session.infoCookie.userId) {
//         res.redirect("/petition");
//     }
// });

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
        console.log("------FIRST NAMEEEEE----");
        console.log(req.session.infoCookie.firstName);

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
    ///Check the url you get from user to make sure it's not malicious///
    getSignersInfo()
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
                        req.session.infoCookie = {};
                        req.session.infoCookie.userId = result.rows[0].id;
                        req.session.infoCookie.firstName = result.rows[0].first;
                        req.session.infoCookie.lastName = result.rows[0].last;
                        getSignatureIdByUserId(result.rows[0].id).then(
                            (result) => {
                                console.log("------RESULT FOR GET SIG------");

                                console.log(result);

                                if (result.rows.length > 0) {
                                    req.session.infoCookie.signatureId =
                                        result.rows[0].id;
                                    console.log(
                                        "------req.session.infoCookie-----"
                                    );
                                    console.log(req.session.infoCookie);

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
    if (
        !userInfo.homePage.startsWith("https://") &&
        !userInfo.homePage.startsWith("http://")
    ) {
        console.log("------MALICIOUS URL------");
        userInfo.homePage = `https://${userInfo.homePage}`;
    }
    insertProfileInfo(
        userInfo.age,
        userInfo.city,
        userInfo.homePage,
        req.session.infoCookie.userId
    )
        .then((result) => {
            console.log("----------RESULT IN POST /PROFILE----------");
            console.log(result);
        })
        .catch((err) => {
            console.log("ERROR IN CATCH PSOT PROFILE", err);
        });
    res.redirect("/petition");
});

app.get("/signers/:city", (req, res) => {
    getSignersByCity(req.params.city)
        .then((result) => {
            res.render("signers-by-city", {
                layout: "main",
                city: req.params.city,
                signers: result.rows,
            });
        })
        .catch((err) => {
            console.log("ERROR IN SIGNERS/:CITY: ", err);
        });
});

app.get("/profile/edit", (req, res) => {
    if (req.session.infoCookie.userId) {
        getInfoForEdit(req.session.infoCookie.userId).then((result) => {
            console.log("-----RESULT IN PROFILE/EDIT-----");
            console.log(result);
            res.render("profile-edit", {
                layout: "main",
                profileInfo: result.rows,
            });
        });
    } else {
        console.log("byebyebyebeyb");
    }
});

app.post("/profile/edit", (req, res) => {
    const userInfo = req.body;
    console.log("-------USER INFO POST /PROFILE/EDIT-------");
    console.log(userInfo);
    if (userInfo.password == "") {
        updateThreeColumns(
            userInfo.firstName,
            userInfo.lastName,
            userInfo.email,
            req.session.infoCookie.userId
        )
            .then((result) => {
                console.log("------RESULTS IN POST PROFILE/EDIT--------");
                console.log(result);
            })
            .catch((err) => {
                console.log("ERROR IN CATCH /PROFILE/EDIT: ", err);
            });
    } else {
        updateFourColumns(
            userInfo.firstName,
            userInfo.lastName,
            userInfo.email,
            userInfo.password,
            req.session.infoCookie.userId
        ).then((result) => {
            console.log("------RESULTS IN UPDATE 4 COLUMS-------");
            console.log(result);
            hash(result.rows[0].password).then((hashedPw) => {
                console.log("-----HASHED PW IN 4---------");
                console.log(hashedPw);
                ///// INSERT/UPDATE THE NEW PASSWORD INTO THE DB //////
            });
        });
    }
    console.log("---USER INFO BEFORE CHECK-----");

    console.log(userInfo);

    upsertUserProfile(
        userInfo.age,
        userInfo.city,
        userInfo.homePage,
        req.session.infoCookie.userId
    )
        .then((result) => {
            console.log("-----RESULT IN UPSERT-----");
            console.log(result);
        })
        .catch((err) => {
            console.log("ERROR IN UPSERT: ", err);
        });
    res.redirect("/thanks");
});

app.listen(process.env.PORT || 8080, () => {
    console.log("PETITION RUNING!");
});
