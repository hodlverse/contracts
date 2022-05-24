const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
const loadFixture = require("./fixtures");
use(solidity);

describe("Migrator", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.owner = this.signers[0];
    this.bob = this.signers[1];
    this.dev = this.signers[2];
    this.minter = this.signers[0];

    this.Core = await ethers.getContractFactory("Core");
    this.Migrator = await ethers.getContractFactory("Migrator");
    this.ERC20Mock = await ethers.getContractFactory("ERC20Mock", this.minter);
  });

  beforeEach(async function () {
    const {
      token0,
      money,
      factory: factory1,
      router: router1,
      weth9,
    } = await loadFixture();

    const { factory: factory2, router: router2, buyback } = await loadFixture();

    this.money = money;

    this.weth = await this.ERC20Mock.deploy("WETH", "WETH", 18, "100000000");
    await this.weth.deployed();

    this.factory1 = factory1;

    this.factory2 = factory2;

    this.router1 = router1;

    this.router2 = router2;

    this.buyback = buyback;

    await this.factory1.setBuyback(this.buyback.address);
    await this.factory2.setBuyback(this.buyback.address);

    this.token = token0;

    const pair1 = await this.factory1.createPair(
      this.weth.address,
      this.token.address
    );

    this.lp1 = await this.Core.attach((await pair1.wait()).events[0].args.pair);

    const pair2 = await this.factory2.createPair(
      this.weth.address,
      this.token.address
    );

    this.lp2 = await this.Core.attach((await pair2.wait()).events[0].args.pair);

    this.migrator = await this.Migrator.deploy(
      this.router1.address,
      this.router2.address
    );
    await this.migrator.deployed();
  });

  it("should do the migration successfully", async function () {
    await this.token
      .connect(this.minter)
      .approve(this.lp1.address, "100000000", { from: this.minter.address });

    await this.token
      .connect(this.minter)
      .transfer(this.lp1.address, "10000000", { from: this.minter.address });

    await this.weth
      .connect(this.minter)
      .transfer(this.lp1.address, "500000", { from: this.minter.address });

    await this.lp1.mint(this.minter.address);
    expect(await this.lp1.balanceOf(this.minter.address)).to.equal("2235067");

    const lpBalance = await this.lp1.balanceOf(this.minter.address);

    // Add some fake revenue
    await this.token
      .connect(this.minter)
      .transfer(this.lp1.address, "100000", { from: this.minter.address });

    await this.weth
      .connect(this.minter)
      .transfer(this.lp1.address, "5000", { from: this.minter.address });

    await this.lp1.sync();

    await this.lp1
      .connect(this.minter)
      .approve(this.migrator.address, lpBalance);

    await this.migrator
      .connect(this.minter)
      .migrate(
        this.token.address,
        this.weth.address,
        lpBalance,
        1,
        1,
        1000000000000
      );
  });

  it("should allow first minting from public only after migrator is gone", async function () {
    await this.factory2.setMigrator(this.migrator.address);

    this.tokenx = await this.ERC20Mock.deploy(
      "TOKENX",
      "TOKENX",
      18,
      "100000000"
    );
    await this.tokenx.deployed();

    const pair = await this.factory2.createPair(
      this.weth.address,
      this.tokenx.address
    );

    this.lpx = await this.Core.attach((await pair.wait()).events[0].args.pair);

    await this.weth
      .connect(this.minter)
      .transfer(this.lpx.address, "10000000", { from: this.minter.address });
    await this.tokenx
      .connect(this.minter)
      .transfer(this.lpx.address, "500000", { from: this.minter.address });
    await expect(this.lpx.mint(this.minter.address)).to.be.revertedWith(
      "Must not have migrator"
    );
  });
});
