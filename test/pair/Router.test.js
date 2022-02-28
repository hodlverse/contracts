const {use, expect} = require("chai");
const {ethers, waffle} = require("hardhat");
const {solidity} = waffle;
use(solidity);
const {ADDRESS_ZERO} = require('../utilities/index')

describe("Router", function () {

    before(async function () {
        this.signers = await ethers.getSigners();
        this.alice = this.signers[0];
        this.bob = this.signers[1];
        this.carol = this.signers[2];
        this.dev = this.signers[3];
        this.minter = this.signers[4];
        this.owner = this.signers[5];
        this.router = this.signers[6];

        this.ERC20Mock = await ethers.getContractFactory("ERC20Mock");

        this.WETH9 = await ethers.getContractFactory("WETH9");
        this.MoneyToken = await ethers.getContractFactory("MoneyToken");
        this.Factory = await ethers.getContractFactory("Factory");
        this.Buyback = await ethers.getContractFactory("Buyback");
        this.Reserve = await ethers.getContractFactory("Reserve");
        this.Router = await ethers.getContractFactory("Router");
        this.HodlLibrary = await ethers.getContractFactory("HodlLibrary");
    });
    beforeEach(async function () {
        this.firstErc20Token = await this.ERC20Mock.deploy("Token One", "TOKEN1", 10000000000);
        this.secondErc20Token = await this.ERC20Mock.deploy("Token Two", "TOKEN2", 10000000000);

        this.hodlLibrary =  await this.HodlLibrary.deploy();

        this.weth9 = await this.WETH9.deploy();
        this.money = await this.MoneyToken.deploy();
        this.factory = await this.Factory.deploy(this.money.address, this.money.address, 1);
        this.router = await this.Router.deploy(this.factory.address, this.weth9.address);
        this.buyback = await this.Buyback.deploy(
            this.router.address,
            this.money.address
        );
        this.reserve = await this.Reserve.deploy(
            this.money.address,
            this.buyback.address
        );

        await this.factory.setBuyback(this.buyback.address)
    });
    it("should set correct state variables", async function () {
        const factoryAddress = await this.router.factory()
        const wethAddress = await this.router.WETH()

        expect(factoryAddress).to.equal(this.factory.address);
        expect(wethAddress).to.equal(this.weth9.address);
    });

    it("should be able to add liquidity if not enough approve", async function () {
        await expect(this.router.addLiquidity(this.firstErc20Token.address, this.secondErc20Token.address, "1000", "1000", "1", "1", this.alice.address, new Date().getTime())).to.be.revertedWith("ERC20: transfer amount exceeds allowance")

        await this.firstErc20Token.approve(this.router.address, "50")
        await this.secondErc20Token.approve(this.router.address, "50")

        await expect(this.router.addLiquidity(this.firstErc20Token.address, this.secondErc20Token.address, "1000", "1000", "1", "1", this.alice.address, new Date().getTime())).to.be.revertedWith("ERC20: transfer amount exceeds allowance")


        await this.firstErc20Token.approve(this.router.address, "1000000")
        await this.secondErc20Token.approve(this.router.address, "1000000")




        await this.router.addLiquidity(this.firstErc20Token.address, this.secondErc20Token.address, 10000, 10000, 1, 1, this.alice.address, new Date().getTime())

        //await transactionHash.wait();

        expect(await this.firstErc20Token.balanceOf(this.alice.address)).to.equal("9999990000")
        expect(await this.secondErc20Token.balanceOf(this.alice.address)).to.equal("9999990000")

        console.log(this.hodlLibrary.address)


        // await this.sushi.approve(this.bar.address, "50")
        // await expect(this.bar.enter("100")).to.be.revertedWith("ERC20: transfer amount exceeds allowance")
        // await this.sushi.approve(this.bar.address, "100")
        // await this.bar.enter("100")
        // expect(await this.bar.balanceOf(this.alice.address)).to.equal("100")
    })




    // it("should be able to add liquidity", async function () {
    //     await this.router.addLiquidity(this.firstErc20Token.address, this.secondErc20Token.address, 1, 1, 0, 0, this.alice.address, new Date().getTime());
    //     expect(await this.factory.allPairsLength()).to.equal(1);
    // })

});
