const spicedPg = require("spiced-pg");
const db = spicedPg(`postgres:postgres:postgres@localhost:5432/petition`);

module.exports.insertSignature = (first, last, signature) => {
    return db.query(
        `INSERT INTO signature (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
        [first, last, signature]
    );
};

module.exports.getFirstAndLast = () => {
    return db.query(`SELECT first, last FROM signature`);
};

module.exports.getSignatureById = (userId) => {
    return db.query(
        `SELECT first, last , signature FROM signature WHERE id = $1`,
        [userId]
    );
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

// module.exports.signatureId = () => {
//     return.db.query(`SELECT signature FROM signature WHERE id = $1`,
//         userId,
//     };

// module.exports.insertSignature = (first, last, signature) => {
//     return db.query(
//         `INSERT INTO signature (first, last, signature) VALUES ($1, $2, $3) RETURNING id`,
//         [first, last, signature]
//     );
// };

// module.exports.getAllData = () => {
//     return db.query(`SELECT first , last FROM signature`);
// };
