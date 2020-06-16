const express = require("express");
const app = express();
const handlebars = require("express-handlebars");
const http = require("http");
const fs = require("fs");

//// NOT SURE WHAT THIS IS DOING ////
app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

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

app.listen(8080, () => {
    console.log("server listening!");
});
