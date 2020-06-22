const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:postgres:postgres@localhost:5432/petition`
);

module.exports.insertSignature = (signature, id) => {
    return db.query(
        `INSERT INTO signature (signature, user_id) VALUES ($1, $2) RETURNING id`,
        [signature, id]
    );
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
    return db.query(`SELECT signature FROM signature WHERE user_id = $1`, [
        userId,
    ]);
};

module.exports.insertProfileInfo = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id`,
        [age, city, url, userId]
    );
};

module.exports.getSingersInfo = () => {
    return db.query(`SELECT first, last, age, city, url
    FROM users
    JOIN signature
    ON users.id = signature.user_id
    JOIN user_profiles
    ON signature.id = user_profiles.user_id`);
};
