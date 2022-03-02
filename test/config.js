const { expandToNDecimals } = require("./utilities/index");

module.exports = {
  ercTokenName: "Test Token",
  ercTokenSymbol: "TT",
  ercTokenSupply: expandToNDecimals("1000000"),
};
