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

// app.get("/petition", (req, res) => {
//     res.render("home", {
//         layout: null,
//     });
// });

app.get("/petition", (req, res) => {
    req.on("ERROR", (err) => {
        console.log("ERROR IN REQ: ", err);
    });
    console.log("working so far");
    res.setHeader("content-type", "text/html");
    res.statusCode = 200;
    res.render("home", {
        layout: null,
    });
});

// app.get("/petition", (req, res) => {
//     req.on("ERROR", (err) => {
//         console.log("ERROR IN REQ: ", err);
//     });
//     console.log("working so far");
//     res.setHeader("content-type", "text/html");
//     res.statusCode = 200;
//     res.end(`
//                 <!doctype html>
//                 <html>
//                 <title>petition</title>
//                 <h1>BLACK LIVES MATTERS!</h1>
//                 </html>`);
// });

app.listen(8080, () => {
    console.log("server listening!");
});
