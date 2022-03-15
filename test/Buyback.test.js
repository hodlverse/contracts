const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
use(solidity);

const ReserveHelper = require("./helpers/Reserve.helper");
const { ADDRESS_ZERO } = require("./utilities");

describe("Buyback", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.owner = this.signers[0];
    this.alice = this.signers[1];
    this.bob = this.signers[2];
    this.carol = this.signers[3];

    this.reserveHelper = new ReserveHelper(this.owner);
  });

  beforeEach(async function () {
    const { moneyToken, wethToken, buyback, reserve } =
      await this.reserveHelper.init();
    this.money = moneyToken;
    this.buyback = buyback;
    this.reserve = reserve;
    this.wethToken = wethToken;
  });

  it("should set Reserve", async function () {
    const newReserve = this.signers[3].address;
    await expect(this.buyback.setReserve(ADDRESS_ZERO)).to.be.revertedWith(
      "Buyback:setReserve:: ERR_ZERO_ADDR"
    );

    await this.buyback.setReserve(newReserve);
    expect(await this.buyback.reserve()).to.equal(newReserve);
  });

  it("should update Money", async function () {
    const newMoney = this.signers[3].address;
    await expect(this.buyback.updateMoney(ADDRESS_ZERO)).to.be.revertedWith(
      "Buyback:updateMoney:: ERR_ZERO_ADDR"
    );

    await this.buyback.updateMoney(newMoney);
    expect(await this.buyback.money()).to.equal(newMoney);
  });

  it("should update Router", async function () {
    const newRouter = this.signers[3].address;
    await expect(this.buyback.updateRouter(ADDRESS_ZERO)).to.be.revertedWith(
      "Buyback:updateRouter:: ERR_ZERO_ADDR"
    );

    await this.buyback.updateRouter(newRouter);
    expect(await this.buyback.router()).to.equal(newRouter);
  });

  it("should swap", async function () {
    await this.reserveHelper.dummySwapsForRewards(this.alice);

    await this.wethToken.deposit({ value: "1000000" });
    await this.wethToken.transfer(this.buyback.address, "1000000");

    await expect(
      this.buyback.swapTokens(1, this.wethToken.address, [
        this.wethToken.address,
        this.wethToken.address,
      ])
    ).to.be.revertedWith("Buyback:swapAndSendToReserve:: ERR_NOT_MONEY");

    await expect(
      this.buyback.swapTokens(1, ADDRESS_ZERO, [
        this.wethToken.address,
        this.money.address,
      ])
    ).to.be.revertedWith(
      "Buyback:swapAndSendToReserve:: ERR_INVALID_TOKEN_ADDRESS"
    );

    await expect(
      this.buyback.swapTokens(1, this.wethToken.address, [])
    ).to.be.revertedWith("Buyback:swapAndSendToReserve:: ERR_INVALID_PATH");

    await expect(
      this.buyback.swapTokens(1, this.wethToken.address, [
        this.money.address,
        this.money.address,
      ])
    ).to.be.revertedWith("Buyback:swapAndSendToReserve:: ERR_SAME_TOKEN_SWAP");

    await this.buyback.swapTokens(1, this.wethToken.address, [
      this.wethToken.address,
      this.money.address,
    ]);
  });

  // it("should remove liquidity", async function () {
  //   await this.reserveHelper.addLiquidityETH(
  //     this.alice,
  //     this.moneyToken,
  //     "100000000000000000",
  //     "100000000000000000"
  //   );

  //   const pair = await this.factory.getPair(
  //     this.moneyToken.address,
  //     this.wethToken.address
  //   );

  //   await pair.transfer(this.buyback.address, "10000000000");

  //   await expect(
  //     this.buyback
  //       .connect(this.alice)
  //       .removeLiquidity(this.moneyToken.address, this.wethToken.address, 1, 1)
  //   ).to.be.revertedWith("Ownable: caller is not the owner");

  //   await expect(
  //     this.buyback.removeLiquidity(ADDRESS_ZERO, this.wethToken.address, 1, 1)
  //   ).to.be.revertedWith("Buyback:removeLiquidity:: ERR_INVALID_TOKEN_ADDRESS");

  //   await expect(
  //     this.buyback.removeLiquidity(ADDRESS_ZERO, this.wethToken.address, 0, 1)
  //   ).to.be.revertedWith("Buyback:removeLiquidity:: ERR_INVALID_AMOUNTS");

  //   await this.buyback.removeLiquidity(
  //     this.moneyToken.address,
  //     this.wethToken.address,
  //     1,
  //     1
  //   );
  // });

  it("should remove tokens in case get stuck", async function () {
    await expect(
      this.buyback
        .connect(this.alice)
        .inCaseTokensGetStuck(this.money.address, this.alice.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await this.buyback.inCaseTokensGetStuck(ADDRESS_ZERO, this.alice.address);

    await this.buyback.inCaseTokensGetStuck(
      this.money.address,
      this.alice.address
    );
  });
});
