const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

module.exports.insertSignature = (first, last, signature) => {
    return db.query(
        `INSERT INTO signature (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
        [first, last, signature]
    );
};

module.exports.getFirstAndLast = (userId) => {
    return db.query(`SELECT first, last FROM signature WHERE id = $1`, [
        userId,
    ]);
};

module.exports.getAllData = () => {
    return db.query(`SELECT first , last FROM signature`);
};
