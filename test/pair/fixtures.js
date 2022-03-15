const { deploy, attach } = require("../utilities/deploy");
const Reserve = require("../helpers/Reserve.helper");
const { ethers, waffle } = require("hardhat");

async function v2Fixture() {
  const signers = await ethers.getSigners();
  const alice = signers[0];

  const reserveHelper = new Reserve(alice);

  const {
    moneyToken,
    wethToken,
    goldenTicket,
    factory,
    router,
    buyback,
    reserve,
  } = await reserveHelper.init();

  const money = moneyToken;
  const tokenA = await reserveHelper.deployERC();
  const tokenB = await reserveHelper.deployERC();
  const wethPartner = await reserveHelper.deployERC();
  const weth9 = wethToken;

  const pairAddress = await reserveHelper.createPair(tokenA, tokenB);
  const pair = await attach("Core", pairAddress);

  const WETHPairAddress = await reserveHelper.createPair(weth9, wethPartner);
  const WETHPair = await attach("Core", WETHPairAddress);

  const token0Address = await pair.token0();

  const token0 = tokenA.address === token0Address ? tokenA : tokenB;
  const token1 = tokenA.address === token0Address ? tokenB : tokenA;

  return {
    token0,
    token1,
    weth9,
    wethPartner,
    factory,
    router,
    pair,
    WETHPair,
    money,
    reserve,
    buyback,
  };
}

module.exports = v2Fixture;
