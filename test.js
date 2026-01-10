var bcrypt = require("bcrypt");

const HASH = bcrypt.hashSync("12345678", bcrypt.genSaltSync(8), null);
console.log(HASH)
const isSame = bcrypt.compareSync("12345678","$2b$08$uvHr8tEfkj3wuCahukEUqu2aGK3qIFfn1opbUvuXRJjBBJ.pE4Lva")

console.log(isSame)

const senha = "12345678";
const hash = "$2b$08$uvHr8tEfkj3wuCahukEUqu2aGK3qIFfn1opbUvuXRJjBBJ.pE4Lva";

console.log(bcrypt.compareSync(senha, hash));