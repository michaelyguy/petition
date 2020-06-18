const bcrypt = require("bcryptjs");
let { genSalt, hase, compare } = bcrypt;
const { promisify } = require("util");

genSalt = promisify(genSalt);
hash = promisify(hash);
compare = promisify(compare);

module.exports.hase = (plainTxtPw) =>
    genSalt().then((salt) => hash(plainTxtPw, salt));
module.exports.compare = compare;
