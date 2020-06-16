const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const http = require("http");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/signature`);

//// NOT SURE WHAT THIS IS DOING ////
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

//// ALSO NOT SURE /////
app.use(cookieParser());

//// CSS->inside ////
app.use(express.static("./public"));

app.get("/petition", (req, res) => {
    //// HANDLEBARS TAKE CARE OF THIS /////

    // req.on("ERROR", (err) => {
    //     console.log("ERROR IN REQ: ", err);
    // });
    // res.setHeader("content-type", "text/html");
    // res.statusCode = 200;

    //// HANDLEBARS TAKE CARE OF THIS /////

    res.render("home", {
        layout: "main",
    });
});

app.post("/petitions", (req, res) => {
    return db.query(
        `INSERT INTO signature (first, last, signature) VALUES ($1, $2, $3)`,
        [first, last, signature]
    );
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main",
    });
});

app.listen(8080, () => {
    console.log("server listening!");
});
