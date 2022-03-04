const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
const { ADDRESS_ZERO } = require("../utilities/index");
const loadFixture = require("./fixtures");
use(solidity);

describe("Factory", function () {
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
  });
  beforeEach(async function () {
    const {
      token0,
      token1,
      money,
      factory,
      router,
      buyback,
      reserve,
      weth9,
    } = await loadFixture();

    this.firstErc20Token = token0

    this.secondErc20Token = token1

    this.weth9 = weth9
    this.money =money
    this.factory =factory
    this.router = router
    this.buyback =buyback
    this.reserve = reserve

    await this.factory.setBuyback(this.buyback.address);
  });

  it("should set correct state variables", async function () {
    const owner = this.alice.address;

    const money = await this.factory.money();
    const buyback = await this.factory.buyback();

    const factoryOwner = await this.factory.owner();
    const buybackOwner = await this.buyback.owner();

    expect(money).to.equal(this.money.address);
    expect(buyback).to.equal(this.buyback.address);
    expect(owner).to.equal(factoryOwner);
    expect(owner).to.equal(buybackOwner);
  });

  it("should allow dev and only dev to update dev", async function () {
    await expect(
      this.factory.connect(this.bob).setOwner(this.carol.address)
    ).to.be.revertedWith("HODL: FORBIDDEN");
    await expect(
      this.factory.connect(this.bob).toggleLpFee()
    ).to.be.revertedWith("HODL: FORBIDDEN");
    await expect(
      this.factory.connect(this.bob).setMigrator(this.carol.address)
    ).to.be.revertedWith("HODL: FORBIDDEN");
    await expect(
      this.factory.connect(this.bob).setBuyback(this.buyback.address)
    ).to.be.revertedWith("HODL: FORBIDDEN");
    await expect(
      this.factory.connect(this.bob).setMoney(this.money.address)
    ).to.be.revertedWith("HODL: FORBIDDEN");
    await expect(
      this.factory.connect(this.bob).setSwapFee(1)
    ).to.be.revertedWith("HODL: FORBIDDEN");
    await expect(
      this.factory.connect(this.bob).setBuybackShare(1)
    ).to.be.revertedWith("HODL: FORBIDDEN");
    await expect(
      this.factory.connect(this.bob).setDiscountEligibilityBalance(1)
    ).to.be.revertedWith("HODL: FORBIDDEN");

    await this.factory.connect(this.alice).setOwner(this.carol.address);
    expect(await this.factory.owner()).to.equal(this.carol.address);

    await this.factory.connect(this.carol).toggleLpFee();
    expect(await this.factory.lpFeeOn()).to.equal(true);

    await this.factory.connect(this.carol).setMigrator(this.alice.address);
    expect(await this.factory.migrator()).to.equal(this.alice.address);

    await this.factory.connect(this.carol).setBuyback(ADDRESS_ZERO);
    expect(await this.factory.buyback()).to.equal(ADDRESS_ZERO);

    await this.factory.connect(this.carol).setMoney(ADDRESS_ZERO);
    expect(await this.factory.money()).to.equal(ADDRESS_ZERO);

    await this.factory.connect(this.carol).setSwapFee(11);
    expect(await this.factory.swapFee()).to.equal(11);

    await this.factory.connect(this.carol).setBuybackShare(11);
    expect(await this.factory.buybackShare()).to.equal(11);

    await this.factory.connect(this.carol).setDiscountEligibilityBalance(11);
    expect(await this.factory.discountEligibilityBalance()).to.equal(11);
  });
});
