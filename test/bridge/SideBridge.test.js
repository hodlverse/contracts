const { ethers  } = require("hardhat");
const { use, expect } = require("chai");
const TokenHelper = require('../helpers/Token.helper')

describe("SideBridge", function () {
    before(async function () {
        this.signers = await ethers.getSigners();
        this.alice = this.signers[0];
        this.bob = this.signers[1];

        this.SideBridge = await ethers.getContractFactory("SideBridge");
        this.MainBridge = await ethers.getContractFactory("MainBridge");
        this.MoneyTokenBridge = await ethers.getContractFactory("MoneyTokenBridge");
    });
    beforeEach(async function () {

        this.mainMoneyToken = await this.MoneyTokenBridge.deploy();
        this.token1 =await this.MoneyTokenBridge.deploy();

        await this.mainMoneyToken.mintTo(1000, this.alice.address)
        await this.token1.mintTo(1000, this.alice.address)



        this.sideBridge = await this.SideBridge.deploy(10);
        this.mainBridge = await this.MainBridge.deploy(10);


        await this.token1.transferOwnership(this.sideBridge.address)
        await this.mainMoneyToken.transferOwnership(this.mainBridge.address)

        await this.sideBridge.createSwapPair(this.mainMoneyToken.address, this.token1.address)
        // await this.sideBridge.createSwapPair(this.token1.address, this.mainMoneyToken.address)
    });
    it('Can create pair', async function () {
        await expect(
            this.sideBridge.connect(this.bob).createSwapPair(this.mainMoneyToken.address, this.token1.address)
        ).to.be.revertedWith("Ownable: caller is not the owner");
        //
        const tokenHelper = new TokenHelper(this.alice)
        const mainMoneyToken = await tokenHelper.deployERC()
        const token1 = await tokenHelper.deployERC()
        //
        await this.sideBridge.createSwapPair(mainMoneyToken.address, token1.address)
        //
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
        await this.mainMoneyToken.approve(this.token1.address, "50");

        await this.sideBridge.connect(this.alice).swapSideToMain(this.token1.address, 10, {
            value: 10
        })

        expect(await this.token1.balanceOf(this.alice.address)).to.equal("990");
    });


    it("ETH -> Sidechain", async function () {
        await expect(this.sideBridge.swapSideToMain(this.token1.address, 10, {
            value: 10
        })).to.be.revertedWith("Money::transferFrom: transfer amount exceeds spender allowance");
        await this.token1.approve(this.sideBridge.address, "50");
        await this.mainMoneyToken.approve(this.token1.address, "50");

        await this.sideBridge.connect(this.alice).swapSideToMain(this.token1.address, 10, {
            value: 10
        })

        await this.sideBridge.fillMain2SideSwap('0xde9f71148e893be4442741d95369eac73fd7c7a53d4d9d46acd30aba5a64d06c', this.mainMoneyToken.address,this.alice.address, 10)
        expect(await this.token1.balanceOf(this.sideBridge.address)).to.equal("0");
    });


});
