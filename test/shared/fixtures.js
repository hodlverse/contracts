const {deploy, attach} = require('../utilities/deploy')
const {expandToNDecimals} =  require('../utilities/index')
async function v2Fixture() {
    const money = await deploy("MoneyToken" )
    const tokenA = await deploy("ERC20Mock", ["Token One", "TOKEN1", expandToNDecimals(10000)])
    const tokenB = await deploy("ERC20Mock", ["Token Two", "TOKEN2", expandToNDecimals(10000)])
    const wethPartner = await deploy("ERC20Mock", ["Token Three", "TOKEN3", expandToNDecimals(10000)])
    const weth9 = await deploy("WETH9")
    const goldenNFTMock = await deploy("GoldenNFTMock")

    const factory = await deploy("Factory", [money.address, goldenNFTMock.address, 1])

    const router = await deploy("Router", [factory.address, weth9.address])

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
