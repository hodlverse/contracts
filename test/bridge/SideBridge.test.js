const { ethers  } = require("hardhat");
const { use, expect } = require("chai");
const TokenHelper = require('../helpers/Token.helper')

describe.only("SideBridge", function () {
    before(async function () {
        this.signers = await ethers.getSigners();
        this.alice = this.signers[0];
        this.bob = this.signers[1];

        this.SideBridge = await ethers.getContractFactory("SideBridge");
        this.MoneyTokenBridge = await ethers.getContractFactory("MoneyTokenBridge");
    });
    beforeEach(async function () {
        const tokenHelper = new TokenHelper(this.alice)
        this.mainMoneyToken = await tokenHelper.deployERC()
        this.token1 = await this.MoneyTokenBridge.deploy();

        // await this.mainMoneyToken.mintTo(1000, this.alice.address)
        await this.token1.mintTo(1000, this.alice.address)

        this.sideBridge = await this.SideBridge.deploy(10);
        await this.sideBridge.createSwapPair(this.mainMoneyToken.address, this.token1.address)
    });
    it('Can create pair', async function () {
        await expect(
            this.sideBridge.connect(this.bob).createSwapPair(this.mainMoneyToken.address, this.token1.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");

        const tokenHelper = new TokenHelper(this.alice)
        const mainMoneyToken = await tokenHelper.deployERC()
        const token1 = await tokenHelper.deployERC()

        await this.sideBridge.createSwapPair(mainMoneyToken.address, token1.address)

        const respnseSideAddress = await this.sideBridge.swapMappingMainToSide(mainMoneyToken.address)
        expect(respnseSideAddress).to.equal(token1.address)
        const responseMainAddress = await this.sideBridge.swapMappingSideToMain(token1.address)
        expect(responseMainAddress).to.equal(mainMoneyToken.address)
    });
    it('Side to ETH chain', async function () {
        await expect(this.sideBridge.swapSideToMain(this.token1.address, 10, {
            value: 10
        })).to.be.revertedWith("Money::transferFrom: transfer amount exceeds spender allowance");
        await this.token1.approve(this.sideBridge.address, "50");
        await this.sideBridge.swapSideToMain(this.token1.address, 10, {
            value: 10
        })
        expect(await this.token1.balanceOf(this.sideBridge.address)).to.equal("10");
    });


});
