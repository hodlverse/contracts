const { ethers  } = require("hardhat");
const { use, expect } = require("chai");
const TokenHelper = require('../helpers/Token.helper')

describe("MainBridge", function () {
    before(async function () {
        this.signers = await ethers.getSigners();
        this.alice = this.signers[0];

        this.MainBridge = await ethers.getContractFactory("MainBridge");
    });
    beforeEach(async function () {
        const tokenHelper = new TokenHelper(this.alice)
        this.moneyToken = await tokenHelper.deployERC()
        this.token1 = await tokenHelper.deployERC()

        this.mainBridge = await this.MainBridge.deploy(10);
        await this.mainBridge.registerSwapPairToSide(this.moneyToken.address)
    });
    it('Can register token', async function () {
        const oldResponse = await this.mainBridge.registeredToken(this.token1.address)
        expect(oldResponse).to.equal(false)
        await this.mainBridge.registerSwapPairToSide(this.token1.address)
        const newResponse = await this.mainBridge.registeredToken(this.token1.address)
        expect(newResponse).to.equal(true)
    });
    it("ETH -> Side chain", async function () {
        await expect(this.mainBridge.swapETH2Side(this.moneyToken.address, 10, {
            value: 10
        })).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
        await this.moneyToken.approve(this.mainBridge.address, "50");
        await this.mainBridge.swapETH2Side(this.moneyToken.address, 10, {
            value: 10
        })
        expect(await this.moneyToken.balanceOf(this.mainBridge.address)).to.equal("10");
    });

    it("Side chain -> ETH", async function () {
        await expect(this.mainBridge.swapETH2Side(this.moneyToken.address, 10, {
            value: 10
        })).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
        await this.moneyToken.approve(this.mainBridge.address, "50");
        await this.mainBridge.swapETH2Side(this.moneyToken.address, 10, {
            value: 10
        })
        expect(await this.moneyToken.balanceOf(this.mainBridge.address)).to.equal("10");

        await this.mainBridge.fillSideETHSwap('0xde9f71148e893be4442741d95369eac73fd7c7a53d4d9d46acd30aba5a64d06c', this.moneyToken.address, this.alice.address, 10)
        expect(await this.moneyToken.balanceOf(this.mainBridge.address)).to.equal("0");
    });



});
