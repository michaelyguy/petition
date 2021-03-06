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

module.exports.insertUserInfo = (first, last, email, password) => {
    return db.query(
        `INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id`,
        [first, last, email, password]
    );
};

module.exports.getHashedPassword = (email) => {
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]);
};

module.exports.getSignatureIdByUserId = (userId) => {
    return db.query(`SELECT id FROM signature WHERE user_id = $1`, [userId]);
};

module.exports.insertProfileInfo = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
        [age || null, city || null, url || null, userId]
    );
};

module.exports.getSignersInfo = () => {
    return db.query(`SELECT first, last, age, city, url
    FROM users
    JOIN signature
    ON users.id = signature.user_id
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id`);
};

module.exports.getSignersByCity = (city) => {
    return db.query(
        `SELECT first, last, age, url
    FROM users
    JOIN signature
    ON users.id = signature.user_id
    LEFT JOIN user_profiles
    ON users.id = user_profiles.user_id
    WHERE LOWER(city) = LOWER($1)
    `,
        [city]
    );
};

module.exports.getInfoForEdit = (userId) => {
    return db.query(
        `SELECT *
    FROM users
    LEFT JOIN user_profiles    
    ON users.id = user_profiles.user_id
    WHERE users.id = $1`,
        [userId]
    );
};

module.exports.updateThreeColumns = (first, last, email, userId) => {
    return db.query(
        `UPDATE users
         SET first = $1, last = $2, email = $3 WHERE users.id = $4 RETURNING *`,
        [first, last, email, userId]
    );
};

module.exports.updateFourColumns = (first, last, email, password, userId) => {
    return db.query(
        `UPDATE users
         SET first = $1, last = $2, email = $3, password = $4 WHERE users.id = $5 RETURNING *`,
        [first, last, email, password, userId]
    );
};

module.exports.upsertUserProfile = (age, city, url, userId) => {
    return db.query(
        `INSERT INTO user_profiles 
        (age ,city, url, user_id) VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id)
        DO UPDATE
        SET age = $1, city = $2, url = $3, user_id = $4`,
        [age || null, city || null, url || null, userId]
    );
};

module.exports.deleteSig = (signatureId) => {
    return db.query(`DELETE FROM signature WHERE id = $1`, [signatureId]);
};
