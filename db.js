const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

module.exports.insertSignature = (signature, id) => {
    return db.query(
        `INSERT INTO signature (signature, user_id) VALUES ($1, $2) RETURNING id`,
        [signature, id]
    );
};

module.exports.getFirstAndLast = () => {
    return db.query(`SELECT first, last FROM signature`);
};

module.exports.getSignatureById = (userId) => {
    return db.query(`SELECT signature FROM signature WHERE id = $1`, [userId]);
};

module.exports.getAllData = () => {
    return db.query(`SELECT * FROM signature`);
};

module.exports.insertUserInfo = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    );
};

module.exports.getHashedPassword = (email) => {
    return db.query(`SELECT password FROM users WHERE email = $1`, [email]);
};

module.exports.getSignature = (userId) => {
    return db.query(`SELECT signature FROM signature WHERE signature = $1`, [
        userId,
    ]);
};
