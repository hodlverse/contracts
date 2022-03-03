const {deploy, attach} = require('../utilities/deploy')
const {expandToNDecimals} =  require('../utilities/index')
const TokenHelper = require('../helpers/Token.helper')
const PairHelper = require('../helpers/Pair.helper')
const { ethers, waffle } = require("hardhat");

async function v2Fixture() {
    const signers = await ethers.getSigners();
    const alice = signers[0];
    const bob = signers[0];

    const tokenHelper = new TokenHelper(alice)
    const pairHelper = new PairHelper(alice, alice)


    const {moneyToken, wethToken, factory, router} = await pairHelper.init()

    const money = moneyToken
    const tokenA = await tokenHelper.deployERC()
    const tokenB =  await tokenHelper.deployERC()
    const wethPartner =  await tokenHelper.deployERC()
    const weth9 = wethToken





    const buyback = await deploy("Buyback", [router.address, money.address])
    const reserve = await deploy("Reserve", [money.address, buyback.address])

    await factory.setBuyback(buyback.address);
    await buyback.setReserve(reserve.address);

    await factory.createPair(tokenA.address, tokenB.address)
    const pairAddress = await factory.getPair(tokenA.address, tokenB.address)
    const pair = await attach("Core",pairAddress);


    await factory.createPair(weth9.address, wethPartner.address)
    const WETHPairAddress = await factory.getPair(weth9.address, wethPartner.address)
    const WETHPair = await attach("Core",WETHPairAddress);


    const token0Address = await pair.token0()

    const token0 = tokenA.address === token0Address ? tokenA : tokenB
    const token1 = tokenA.address === token0Address ? tokenB : tokenA

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
        reserve
    }
}

module.exports = v2Fixture;
