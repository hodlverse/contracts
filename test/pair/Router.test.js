const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
use(solidity);
const loadFixture = require("./fixtures");
const { expandToNDecimals } = require("../utilities/index");

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
      wethPartner,
      weth9,
      pair,
      WETHPair,
    } = await loadFixture();

    this.firstErc20Token = token0;
    this.secondErc20Token = token1;

    this.pair = pair;
    this.WETHPair = WETHPair;

    this.weth9 = weth9;
    this.money = money;

    this.factory = factory;

    this.router = router;

    this.buyback = buyback;
    this.reserve = reserve;

    this.wethPartner = wethPartner;
  });
  it("should set correct state variables", async function () {
    const factoryAddress = await this.router.factory();
    const wethAddress = await this.router.WETH();

    expect(factoryAddress).to.equal(this.factory.address);
    expect(wethAddress).to.equal(this.weth9.address);
  });

  it("should be able to add liquidity if not enough approve (erc20)", async function () {
    const liquidityAmount = expandToNDecimals(1);
    await expect(
      this.router.addLiquidity(
        this.firstErc20Token.address,
        this.secondErc20Token.address,
        liquidityAmount,
        liquidityAmount,
        0,
        0,
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
        liquidityAmount,
        liquidityAmount,
        0,
        0,
        this.alice.address,
        new Date().getTime()
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

    await this.firstErc20Token.approve(this.router.address, liquidityAmount);
    await this.secondErc20Token.approve(this.router.address, liquidityAmount);

    await this.router.addLiquidity(
      this.firstErc20Token.address,
      this.secondErc20Token.address,
      liquidityAmount,
      liquidityAmount,
      0,
      0,
      this.alice.address,
      new Date().getTime()
    );

    expect(await this.firstErc20Token.balanceOf(this.pair.address)).to.equal(
      liquidityAmount
    );
  });

  it("should be able to add liquidity for eth", async function () {
    const token0Amount = expandToNDecimals(1);
    const ethAmount = expandToNDecimals(4);

    await expect(
      this.router.addLiquidityETH(
        this.wethPartner.address,
        token0Amount,
        0,
        0,
        this.alice.address,
        new Date().getTime(),
        {
          value: ethAmount,
        }
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

    await this.wethPartner.approve(this.router.address, "50");

    await expect(
      this.router.addLiquidityETH(
        this.wethPartner.address,
        token0Amount,
        0,
        0,
        this.alice.address,
        new Date().getTime(),
        {
          value: ethAmount,
        }
      )
    ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");

    await this.wethPartner.approve(this.router.address, token0Amount);

    await this.router.addLiquidityETH(
      this.wethPartner.address,
      token0Amount,
      0,
      0,
      this.alice.address,
      new Date().getTime(),
      {
        value: ethAmount,
      }
    );

    expect(await this.wethPartner.balanceOf(this.WETHPair.address)).to.equal(
      token0Amount
    );

    expect(await this.weth9.balanceOf(this.WETHPair.address)).to.equal(
      ethAmount
    );
  });
});
describe("Removing Liquidity", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.alice = this.signers[0];
    this.bob = this.signers[1];
    this.carol = this.signers[2];
    this.dev = this.signers[3];
    this.minter = this.signers[4];
    this.owner = this.signers[5];
    this.router = this.signers[6];
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
      wethPartner,
      weth9,
      pair,
      WETHPair,
    } = await loadFixture();

    this.token0 = token0;
    this.token1 = token1;

    this.pair = pair;
    this.WETHPair = WETHPair;

    this.weth9 = weth9;
    this.money = money;

    this.factory = factory;

    this.router = router;

    this.buyback = buyback;
    this.reserve = reserve;

    this.wethPartner = wethPartner;

    await this.token0.approve(this.router.address, expandToNDecimals(10));
    await this.token1.approve(this.router.address, expandToNDecimals(10));
    await this.wethPartner.approve(this.router.address, expandToNDecimals(10));

    await this.router.addLiquidity(
      this.token0.address,
      this.token1.address,
      expandToNDecimals(2),
      expandToNDecimals(2),
      0,
      0,
      this.alice.address,
      new Date().getTime()
    );

    await this.router.addLiquidityETH(
      this.wethPartner.address,
      expandToNDecimals(1),
      0,
      0,
      this.alice.address,
      new Date().getTime(),
      {
        value: expandToNDecimals(4),
      }
    );
  });

  it("removeLiquidity", async function () {
    await this.pair.approve(this.router.address, expandToNDecimals(2));
    await this.pair.approve(this.alice.address, expandToNDecimals(2));

    const oldLPBalance = await this.pair.balanceOf(this.alice.address);

    await this.router.removeLiquidity(
      this.token0.address,
      this.token1.address,
      expandToNDecimals(1),
      10,
      10,
      this.alice.address,
      new Date().getTime()
    );
    const newLPBalance = await this.pair.balanceOf(this.alice.address);

    expect(Number(oldLPBalance.toString())).to.be.greaterThan(
      Number(newLPBalance.toString())
    );
  });

  it("removeLiquidityETH", async function () {
    await this.wethPartner.approve(this.router.address, expandToNDecimals(2));
    await this.WETHPair.approve(this.router.address, expandToNDecimals(2));
    await this.WETHPair.approve(this.alice.address, expandToNDecimals(2));

    const oldLPBalance = await this.WETHPair.balanceOf(this.alice.address);

    await this.router.removeLiquidityETH(
      this.wethPartner.address,
      expandToNDecimals(1),
      1,
      1,
      this.alice.address,
      new Date().getTime()
    );

    const newLPBalance = await this.WETHPair.balanceOf(this.alice.address);
    expect(Number(oldLPBalance.toString())).to.be.greaterThan(
      Number(newLPBalance.toString())
    );
  });

  it("removeLiquidityETHSupportingFeeOnTransferTokens", async function () {
    await this.wethPartner.approve(this.router.address, expandToNDecimals(2));
    await this.WETHPair.approve(this.router.address, expandToNDecimals(2));
    await this.WETHPair.approve(this.alice.address, expandToNDecimals(2));

    const oldLPBalance = await this.WETHPair.balanceOf(this.alice.address);

    await this.router.removeLiquidityETHSupportingFeeOnTransferTokens(
      this.wethPartner.address,
      expandToNDecimals(1),
      1,
      1,
      this.alice.address,
      new Date().getTime()
    );

    const newLPBalance = await this.WETHPair.balanceOf(this.alice.address);
    expect(Number(oldLPBalance.toString())).to.be.greaterThan(
      Number(newLPBalance.toString())
    );
  });
});
describe("Swapping", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.alice = this.signers[0];
    this.bob = this.signers[1];
    this.carol = this.signers[2];
    this.dev = this.signers[3];
    this.minter = this.signers[4];
    this.owner = this.signers[5];
    this.router = this.signers[6];
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
      wethPartner,
      weth9,
      pair,
      WETHPair,
    } = await loadFixture();

    this.token0 = token0;
    this.token1 = token1;

    this.pair = pair;
    this.WETHPair = WETHPair;

    this.weth9 = weth9;
    this.money = money;

    this.factory = factory;

    this.router = router;

    this.buyback = buyback;
    this.reserve = reserve;

    this.wethPartner = wethPartner;

    await this.token0.approve(this.router.address, expandToNDecimals(10));
    await this.token1.approve(this.router.address, expandToNDecimals(10));
    await this.wethPartner.approve(this.router.address, expandToNDecimals(10));

    await this.router.addLiquidity(
      this.token0.address,
      this.token1.address,
      expandToNDecimals(2),
      expandToNDecimals(2),
      0,
      0,
      this.alice.address,
      new Date().getTime()
    );

    await this.router.addLiquidityETH(
      this.wethPartner.address,
      expandToNDecimals(1),
      0,
      0,
      this.alice.address,
      new Date().getTime(),
      {
        value: expandToNDecimals(4),
      }
    );
  });

  it("Exact ERC20 -> ERC20", async function () {
    const swapAmount = expandToNDecimals(1);
    await this.router.swapExactTokensForTokens(
      swapAmount,
      0,
      [this.token0.address, this.token1.address],
      this.alice.address,
      new Date().getTime()
    );
  });

  it("Exact ERC20 -> ERC20 FeeOnTransferTokens", async function () {
    const swapAmount = expandToNDecimals(1);
    await this.router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      swapAmount,
      0,
      [this.token0.address, this.token1.address],
      this.alice.address,
      new Date().getTime()
    );
  });

  it("ERC20 -> Exact ERC20", async function () {
    const swapAmount = expandToNDecimals(1);
    await this.router.swapTokensForExactTokens(
      swapAmount.div(2),
      swapAmount,
      [this.token0.address, this.token1.address],
      this.alice.address,
      new Date().getTime()
    );
  });

  it("ERC20 -> Exact ETH", async function () {
    const swapAmount = expandToNDecimals(1);
    await this.router.swapTokensForExactETH(
      swapAmount.div(2),
      swapAmount,
      [this.wethPartner.address, this.weth9.address],
      this.alice.address,
      new Date().getTime()
    );
  });
  it("Exact ERC20 -> ETH", async function () {
    const swapAmount = expandToNDecimals(1);
    await this.router.swapExactTokensForETH(
      swapAmount,
      swapAmount.div(2),
      [this.wethPartner.address, this.weth9.address],
      this.alice.address,
      new Date().getTime()
    );
  });
  it("Exact ERC20 -> ETH SupportingFeeOnTransferTokens", async function () {
    const swapAmount = expandToNDecimals(1);
    await this.router.swapExactTokensForETHSupportingFeeOnTransferTokens(
      swapAmount,
      swapAmount.div(2),
      [this.wethPartner.address, this.weth9.address],
      this.alice.address,
      new Date().getTime()
    );
  });

  it("ETH -> Exact ERC20", async function () {
    await this.router.swapETHForExactTokens(
      10000000,
      [this.weth9.address, this.wethPartner.address],
      this.alice.address,
      new Date().getTime(),
      {
        value: 1000000000,
      }
    );
  });
  it("Exact ETH -> ERC20", async function () {
    await this.router.swapExactETHForTokens(
      1000000,
      [this.weth9.address, this.wethPartner.address],
      this.alice.address,
      new Date().getTime(),
      {
        value: 1000000000,
      }
    );
  });
  it("Exact ETH -> ERC20 SupportingFeeOnTransferTokens", async function () {
    await this.router.swapExactETHForTokensSupportingFeeOnTransferTokens(
      1000000,
      [this.weth9.address, this.wethPartner.address],
      this.alice.address,
      new Date().getTime(),
      {
        value: 1000000000,
      }
    );
  });
});

describe("Route utils", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.alice = this.signers[0];
    this.bob = this.signers[1];
    this.carol = this.signers[2];
    this.dev = this.signers[3];
    this.minter = this.signers[4];
    this.owner = this.signers[5];
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
      wethPartner,
      weth9,
      pair,
      WETHPair,
    } = await loadFixture();

    this.token0 = token0;
    this.token1 = token1;

    this.pair = pair;
    this.WETHPair = WETHPair;

    this.weth9 = weth9;
    this.money = money;

    this.factory = factory;

    this.router = router;

    this.buyback = buyback;
    this.reserve = reserve;

    this.wethPartner = wethPartner;

    await this.token0.approve(this.router.address, expandToNDecimals(10));
    await this.token1.approve(this.router.address, expandToNDecimals(10));
    await this.wethPartner.approve(this.router.address, expandToNDecimals(10));

    await this.router.addLiquidity(
      this.token0.address,
      this.token1.address,
      expandToNDecimals(2),
      expandToNDecimals(2),
      0,
      0,
      this.alice.address,
      new Date().getTime()
    );

    await this.router.addLiquidityETH(
      this.wethPartner.address,
      expandToNDecimals(1),
      0,
      0,
      this.alice.address,
      new Date().getTime(),
      {
        value: expandToNDecimals(4),
      }
    );
  });

  it("quote", async function () {
    expect(await this.router.quote(1, 100, 200)).to.eq(2);
    expect(await this.router.quote(2, 200, 100)).to.eq(1);
    await expect(this.router.quote(0, 100, 200)).to.be.revertedWith(
      "HodlLibrary: INSUFFICIENT_AMOUNT"
    );
    await expect(this.router.quote(1, 0, 200)).to.be.revertedWith(
      "HodlLibrary: INSUFFICIENT_LIQUIDITY"
    );
    await expect(this.router.quote(1, 100, 0)).to.be.revertedWith(
      "HodlLibrary: INSUFFICIENT_LIQUIDITY"
    );
  });

  it("getAmountOut", async function () {
    expect(await this.router.getAmountOut(2, 100, 100)).to.eq(1);
    await expect(this.router.getAmountOut(0, 100, 100)).to.be.revertedWith(
      "HodlLibrary: INSUFFICIENT_INPUT_AMOUNT"
    );
    await expect(this.router.getAmountOut(2, 0, 100)).to.be.revertedWith(
      "HodlLibrary: INSUFFICIENT_LIQUIDITY"
    );
    await expect(this.router.getAmountOut(2, 100, 0)).to.be.revertedWith(
      "HodlLibrary: INSUFFICIENT_LIQUIDITY"
    );
  });

  it("getAmountIn", async function () {
    expect(await this.router.getAmountIn(1, 100, 100)).to.eq(2);
    await expect(this.router.getAmountIn(0, 100, 100)).to.be.revertedWith(
      "HodlLibrary: INSUFFICIENT_OUTPUT_AMOUNT"
    );
    await expect(this.router.getAmountIn(1, 0, 100)).to.be.revertedWith(
      "HodlLibrary: INSUFFICIENT_LIQUIDITY"
    );
    await expect(this.router.getAmountIn(1, 100, 0)).to.be.revertedWith(
      "HodlLibrary: INSUFFICIENT_LIQUIDITY"
    );
  });

  it("getAmountsOut", async function () {
    await this.token0.approve(this.router.address, expandToNDecimals(10));
    await this.token1.approve(this.router.address, expandToNDecimals(10));
    await this.router.addLiquidity(
      this.token0.address,
      this.token1.address,
      10000,
      10000,
      0,
      0,
      this.alice.address,
      new Date().getTime()
    );

    await expect(
      this.router.getAmountsOut(2, [this.token0.address])
    ).to.be.revertedWith("HodlLibrary: INVALID_PATH");
    const path = [this.token0.address, this.token1.address];
    const amounts = await this.router.getAmountsOut(2, path);

    expect(amounts.map((amount) => amount.toString())).to.deep.eq(["2", "1"]);
  });

  it("getAmountsIn", async function () {
    await this.token0.approve(this.router.address, expandToNDecimals(10));
    await this.token1.approve(this.router.address, expandToNDecimals(10));
    await this.router.addLiquidity(
      this.token0.address,
      this.token1.address,
      10000,
      10000,
      0,
      0,
      this.alice.address,
      new Date().getTime()
    );

    await expect(
      this.router.getAmountsIn(1, [this.token0.address])
    ).to.be.revertedWith("HodlLibrary: INVALID_PATH");
    const path = [this.token0.address, this.token1.address];

    const amounts = await this.router.getAmountsIn(2, path);
    expect(amounts.map((amount) => amount.toString())).to.deep.eq(["3", "2"]);
  });
});
