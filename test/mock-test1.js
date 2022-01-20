const lib = require("./lib");
const lib2 = require("./mockdir");
const { v4 } = require("uuid");

console.log("loading mock-test1");

v4();

lib.mock();

lib2.mock2();