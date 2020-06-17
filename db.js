const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/signature`);

module.exports.insertSignature = (first, last, signature) => {
    return db.query(
        `INSERT INTO signature (first, last, signature) VALUES ($1, $2, $3)`,
        [first, last, signature]
    );
};

module.exports.getFirstAndLast = (first, last) => {
    return db.query(`SELECT first AND last FROM signature (first, last)`, [
        first,
        last,
    ]);
};
