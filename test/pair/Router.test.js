const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
use(solidity);
const { ADDRESS_ZERO } = require("../utilities/index");

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
    this.Core = await ethers.getContractFactory("Core");
    this.GoldenNFTMock = await ethers.getContractFactory("GoldenNFTMock");
  });
  beforeEach(async function () {
    this.goldenNFT = await this.GoldenNFTMock.deploy();
    this.firstErc20Token = await this.ERC20Mock.deploy(
      "Token One",
      "TOKEN1",
      10000000000
    );
    this.secondErc20Token = await this.ERC20Mock.deploy(
      "Token Two",
      "TOKEN2",
      10000000000
    );

    this.hodlLibrary = await this.HodlLibrary.deploy();

    this.weth9 = await this.WETH9.deploy();
    this.money = await this.MoneyToken.deploy();
    this.factory = await this.Factory.deploy(
      this.money.address,
      this.goldenNFT.address,
      1
    );
    this.router = await this.Router.deploy(
      this.factory.address,
      this.weth9.address
    );
    this.buyback = await this.Buyback.deploy(
      this.router.address,
      this.money.address
    );
    this.reserve = await this.Reserve.deploy(
      this.money.address,
      this.buyback.address
    );

    await this.factory.setBuyback(this.buyback.address);
    await this.buyback.setReserve(this.reserve.address);
  });
  it("should set correct state variables", async function () {
    const factoryAddress = await this.router.factory();
    const wethAddress = await this.router.WETH();

    expect(factoryAddress).to.equal(this.factory.address);
    expect(wethAddress).to.equal(this.weth9.address);
  });

  it("should be able to add liquidity if not enough approve (erc20)", async function () {
    await this.factory.createPair(
      this.firstErc20Token.address,
      this.secondErc20Token.address
    );
    expect(await this.factory.allPairsLength()).to.equal(1);

    await expect(
      this.router.addLiquidity(
        this.firstErc20Token.address,
        this.secondErc20Token.address,
        "1000",
        "1000",
        "1",
        "1",
        this.alice.address,
        new Date().getTime()
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

    await this.firstErc20Token.approve(this.router.address, "50");
    await this.secondErc20Token.approve(this.router.address, "50");

    await expect(
      this.router.addLiquidity(
        this.firstErc20Token.address,
        this.secondErc20Token.address,
        "1000",
        "1000",
        "1",
        "1",
        this.alice.address,
        new Date().getTime()
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

    await this.firstErc20Token.approve(this.router.address, "1000000");
    await this.secondErc20Token.approve(this.router.address, "1000000");

    await this.router.addLiquidity(
      this.firstErc20Token.address,
      this.secondErc20Token.address,
      10000,
      10000,
      1,
      1,
      this.alice.address,
      new Date().getTime()
    );

    const lpTokenAddress = await this.factory.getPair(
      this.firstErc20Token.address,
      this.secondErc20Token.address
    );

    const lpTokenContract = await this.ERC20Mock.attach(lpTokenAddress);

    expect(await lpTokenContract.balanceOf(this.alice.address)).to.equal(
      "9000"
    );
  });

  it("should be able to add liquidity for eth", async function () {
    await expect(
      this.router.addLiquidityETH(
        this.firstErc20Token.address,
        "1000",
        "1",
        "1",
        this.alice.address,
        new Date().getTime(),
        {
          value: 1000000,
        }
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

    await this.firstErc20Token.approve(this.router.address, "50");

    await expect(
      this.router.addLiquidityETH(
        this.firstErc20Token.address,
        "1000",
        "1",
        "1",
        this.alice.address,
        new Date().getTime(),
        {
          value: 1000000,
        }
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

    await this.firstErc20Token.approve(this.router.address, "1000000");

    await this.router.addLiquidityETH(
      this.firstErc20Token.address,
      "1000",
      "1",
      "1",
      this.alice.address,
      new Date().getTime(),
      {
        value: 100000,
      }
    );

    const lpTokenAddress = await this.factory.getPair(
      this.weth9.address,
      this.firstErc20Token.address
    );

    const lpTokenContract = await this.ERC20Mock.attach(lpTokenAddress);

    expect(await lpTokenContract.balanceOf(this.alice.address)).to.equal(
      "9000"
    );
  });

  it("should be able to swap erc20 tokens", async function () {
    await this.firstErc20Token.approve(this.router.address, "1000000");
    await this.secondErc20Token.approve(this.router.address, "1000000");
    const buybackAddress = this.buyback.address.toLowerCase();

    const oldBalanceFirstTokenBalance = await this.firstErc20Token.balanceOf(
      this.alice.address
    );

    const swapAmount = 10000;

    const oldBuyBackBalance = await this.firstErc20Token.balanceOf(
      buybackAddress
    );

    await this.factory.createPair(
      this.firstErc20Token.address,
      this.secondErc20Token.address
    );

    expect(await this.factory.allPairsLength()).to.equal(1);
    const swapFee = await this.factory.getSwapFee(this.alice.address);

    await this.router.addLiquidity(
      this.firstErc20Token.address,
      this.secondErc20Token.address,
      swapAmount,
      swapAmount,
      1,
      1,
      this.alice.address,
      new Date().getTime()
    );

    await this.router.swapExactTokensForTokens(
      swapAmount,
      5,
      [this.firstErc20Token.address, this.secondErc20Token.address],
      this.alice.address,
      new Date().getTime()
    );
    const newBuyBackBalanceFromContract = await this.firstErc20Token.balanceOf(
      buybackAddress
    );

    const newBalanceFirstTokenBalance = await this.firstErc20Token.balanceOf(
      this.alice.address
    );

    expect(oldBalanceFirstTokenBalance.sub(swapAmount * 2).toString()).to.equal(
      newBalanceFirstTokenBalance.toString()
    );

    const buybackFee = swapAmount * (swapFee[1].toString() / 1000);
    const newBuyBalance =
      Number(buybackFee) + Number(oldBuyBackBalance.toString());

    expect(newBuyBalance).to.equal(
      Number(newBuyBackBalanceFromContract.toString())
    );
  });

  it("should be able to swap erc20 tokens", async function () {
    await this.firstErc20Token.approve(this.router.address, "1000000");
    await this.secondErc20Token.approve(this.router.address, "1000000");
    const buybackAddress = this.buyback.address.toLowerCase();

    const oldBalanceFirstTokenBalance = await this.firstErc20Token.balanceOf(
      this.alice.address
    );

    const swapAmount = 10000;

    const oldBuyBackBalance = await this.firstErc20Token.balanceOf(
      buybackAddress
    );

    await this.factory.createPair(
      this.firstErc20Token.address,
      this.secondErc20Token.address
    );

    expect(await this.factory.allPairsLength()).to.equal(1);
    const swapFee = await this.factory.getSwapFee(this.alice.address);

    await this.router.addLiquidity(
      this.firstErc20Token.address,
      this.secondErc20Token.address,
      swapAmount,
      swapAmount,
      1,
      1,
      this.alice.address,
      new Date().getTime()
    );

    await this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      swapAmount,
      5,
      [this.firstErc20Token.address, this.secondErc20Token.address],
      this.alice.address,
      new Date().getTime()
    );
    const newBuyBackBalanceFromContract = await this.firstErc20Token.balanceOf(
      buybackAddress
    );

    const newBalanceFirstTokenBalance = await this.firstErc20Token.balanceOf(
      this.alice.address
    );

    expect(oldBalanceFirstTokenBalance.sub(swapAmount * 2).toString()).to.equal(
      newBalanceFirstTokenBalance.toString()
    );

    const buybackFee = swapAmount * (swapFee[1].toString() / 1000);
    const newBuyBalance =
      Number(buybackFee) + Number(oldBuyBackBalance.toString());

    expect(newBuyBalance).to.equal(
      Number(newBuyBackBalanceFromContract.toString())
    );
  });

  it("should be able to swap tokens with eth", async function () {
    const provider = waffle.provider;

    await this.firstErc20Token.approve(this.router.address, "10000000000");

    await this.factory.createPair(
      this.firstErc20Token.address,
      this.weth9.address
    );
    const transactionHash = await this.router.addLiquidityETH(
      this.firstErc20Token.address,
      "1000",
      "1",
      "1",
      this.alice.address,
      new Date().getTime(),
      {
        value: 10000000000,
      }
    );

    await transactionHash.wait();

    expect(await this.factory.allPairsLength()).to.equal(1);

    const swapFee = await this.factory.getSwapFee(this.alice.address);

    const beforeETHBalancce = await provider.getBalance(this.alice.address);
    await this.router.swapExactTokensForETH(
      1000000000,
      5,
      [this.firstErc20Token.address, this.weth9.address],
      this.alice.address,
      new Date().getTime()
    );
    const afterETHBalance = await provider.getBalance(this.alice.address);
  });

  it("should be able to swap tokens with eth", async function () {
    const provider = waffle.provider;

    await this.firstErc20Token.approve(this.router.address, "10000000000");

    await this.factory.createPair(
      this.firstErc20Token.address,
      this.weth9.address
    );
    const transactionHash = await this.router.addLiquidityETH(
      this.firstErc20Token.address,
      "1000",
      "1",
      "1",
      this.alice.address,
      new Date().getTime(),
      {
        value: 10000000000,
      }
    );

    await transactionHash.wait();

    expect(await this.factory.allPairsLength()).to.equal(1);

    const swapFee = await this.factory.getSwapFee(this.alice.address);

    const beforeETHBalancce = await provider.getBalance(this.alice.address);
    await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens(
      1000000000,
      5,
      [this.firstErc20Token.address, this.weth9.address],
      this.alice.address,
      new Date().getTime()
    );
    const afterETHBalance = await provider.getBalance(this.alice.address);
  });

  it("should be able to eth for tokens", async function () {
    const provider = waffle.provider;

    await this.firstErc20Token.approve(this.router.address, "10000000000");

    await this.factory.createPair(
      this.firstErc20Token.address,
      this.weth9.address
    );
    const transactionHash = await this.router.addLiquidityETH(
      this.firstErc20Token.address,
      "1000",
      "10",
      "10",
      this.alice.address,
      new Date().getTime(),
      {
        value: 10000000000,
      }
    );

    await transactionHash.wait();

    expect(await this.factory.allPairsLength()).to.equal(1);

    const swapFee = await this.factory.getSwapFee(this.alice.address);

    const beforeETHBalancce = await provider.getBalance(this.alice.address);
    await this.router.swapETHForExactTokens(
      1,
      [this.weth9.address, this.firstErc20Token.address],
      this.alice.address,
      new Date().getTime(),
      {
        value: 1000000000,
      }
    );
    const afterETHBalance = await provider.getBalance(this.alice.address);
  });

  it("should be able to remove liquidity", async function () {
    await this.firstErc20Token.approve(this.router.address, "1000000");
    await this.secondErc20Token.approve(this.router.address, "1000000");
    await this.factory.createPair(
      this.firstErc20Token.address,
      this.secondErc20Token.address
    );
    await this.router.addLiquidity(
      this.firstErc20Token.address,
      this.secondErc20Token.address,
      10000,
      10000,
      1,
      1,
      this.alice.address,
      new Date().getTime()
    );
    const lpTokenAddress = await this.factory.getPair(
      this.firstErc20Token.address,
      this.secondErc20Token.address
    );

    const lpTokenContract = await this.ERC20Mock.attach(lpTokenAddress);
    await lpTokenContract.approve(this.router.address, "1000000");
    await lpTokenContract.approve(this.alice.address, "1000000");

    const oldLPBalance = await lpTokenContract.balanceOf(this.alice.address);

    await this.router.removeLiquidity(
      this.firstErc20Token.address,
      this.secondErc20Token.address,
      10,
      10,
      10,
      this.alice.address,
      new Date().getTime()
    );

    const newLPBalance = await lpTokenContract.balanceOf(this.alice.address);
    expect(Number(oldLPBalance.toString())).to.be.greaterThan(
      Number(newLPBalance.toString())
    );
  });

  it("should be able to remove eth liquidity", async function () {
    await this.firstErc20Token.approve(this.router.address, "10000001000000");

    await this.factory.createPair(
      this.firstErc20Token.address,
      this.weth9.address
    );
    await this.router.addLiquidityETH(
      this.firstErc20Token.address,
      "1000000",
      "11",
      "11",
      this.alice.address,
      new Date().getTime(),
      {
        value: 100000000,
      }
    );

    const lpTokenAddress = await this.factory.getPair(
      this.firstErc20Token.address,
      this.weth9.address
    );

    const lpTokenContract = await this.ERC20Mock.attach(lpTokenAddress);
    await lpTokenContract.approve(this.router.address, "1000000");
    await lpTokenContract.approve(this.alice.address, "1000000");

    const oldLPBalance = await lpTokenContract.balanceOf(this.alice.address);

    await this.router.removeLiquidityETH(
      this.firstErc20Token.address,
      10,
      1,
      1,
      this.alice.address,
      new Date().getTime()
    );

    const newLPBalance = await lpTokenContract.balanceOf(this.alice.address);
    expect(Number(oldLPBalance.toString())).to.be.greaterThan(
      Number(newLPBalance.toString())
    );
  });

  it("should be able to remove eth liquidity", async function () {
    await this.firstErc20Token.approve(this.router.address, "10000001000000");

    await this.factory.createPair(
      this.firstErc20Token.address,
      this.weth9.address
    );
    await this.router.addLiquidityETH(
      this.firstErc20Token.address,
      "1000000",
      "11",
      "11",
      this.alice.address,
      new Date().getTime(),
      {
        value: 100000000,
      }
    );

    const lpTokenAddress = await this.factory.getPair(
      this.firstErc20Token.address,
      this.weth9.address
    );

    const lpTokenContract = await this.ERC20Mock.attach(lpTokenAddress);
    await lpTokenContract.approve(this.router.address, "1000000");
    await lpTokenContract.approve(this.alice.address, "1000000");

    const oldLPBalance = await lpTokenContract.balanceOf(this.alice.address);

    await this.router.removeLiquidityETHSupportingFeeOnTransferTokens(
      this.firstErc20Token.address,
      10,
      1,
      1,
      this.alice.address,
      new Date().getTime()
    );

    const newLPBalance = await lpTokenContract.balanceOf(this.alice.address);
    expect(Number(oldLPBalance.toString())).to.be.greaterThan(
      Number(newLPBalance.toString())
    );
  });
});
