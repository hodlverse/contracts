const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

const BASE_TEN = 10;
const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
const MAX_INT =
  "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

const MINIMUM_LIQUIDITY = Math.pow(10, 3);

function encodeParameters(types, values) {
  const abi = new ethers.utils.AbiCoder();
  return abi.encode(types, values);
}

// Defaults to e18 using amount * 10^18
function expandToNDecimals(amount, decimals = 18) {
  return BigNumber.from(amount).mul(BigNumber.from(BASE_TEN).pow(decimals));
}

async function verifyBalanceChange(account, change, todo) {
  let before = new BN(await web3.eth.getBalance(account));
  await todo();
  let after = new BN(await web3.eth.getBalance(account));
  let actual = before.sub(after);
  assertEq(change, actual);
}

module.exports = {
  ADDRESS_ZERO,
  MAX_INT,
  encodeParameters,
  expandToNDecimals,
  MINIMUM_LIQUIDITY,
};
