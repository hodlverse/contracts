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
  let before = BigNumber.from(await web3.eth.getBalance(account));
  await todo();
  let after = BigNumber.from(await web3.eth.getBalance(account));
  let actual = before.sub(after);
  assertEq(change, actual);
}

function etherUnsigned(num) {
  return BigNumber.from(num);
}

async function freezeTime(seconds) {
  await rpc({ method: "evm_freezeTime", params: [seconds] });
  return rpc({ method: "evm_mine" });
}

async function rpc(request) {
  return new Promise((okay, fail) =>
    web3.currentProvider.send(request, (err, res) =>
      err ? fail(err) : okay(res)
    )
  );
}

function keccak256(values) {
  return ethers.utils.keccak256(values);
}

module.exports = {
  ADDRESS_ZERO,
  MAX_INT,
  encodeParameters,
  expandToNDecimals,
  etherUnsigned,
  keccak256,
  MINIMUM_LIQUIDITY,
};
