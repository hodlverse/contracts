const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
use(solidity);

const ReserveHelper = require("./helpers/Reserve.helper");
const { ADDRESS_ZERO } = require("./utilities");
const { advanceBlockTo } = require("./utilities/time");

describe("Staking", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.owner = this.signers[0];
    this.bob = this.signers[1];
    this.carol = this.signers[2];
    this.alice = this.signers[3];

    this.Staking = await ethers.getContractFactory("Staking");
    this.reserveHelper = new ReserveHelper(this.owner);
  });

  beforeEach(async function () {
    const { moneyToken, buyback, reserve } = await this.reserveHelper.init();
    this.money = moneyToken;
    this.buyback = buyback;
    this.reserve = reserve;

    this.stake = await this.Staking.deploy(
      this.money.address,
      this.reserve.address
    );

    await this.stake.deployed();

    await this.reserve.addWithdrawers(
      [this.stake.address, this.owner.address],
      [50, 50]
    );

    await this.money.transfer(this.alice.address, "100");
    await this.money.transfer(this.bob.address, "100");
    await this.money.transfer(this.carol.address, "100");
  });

  it("should accumulate rewards", async function () {
    await expect(this.stake.accumulateRewards()).to.be.revertedWith(
      "Staking:accumulateRewards:: ERR_CANNOT_COLLECT_REWARDS"
    );

    await advanceBlockTo(10000);
    await this.reserveHelper.dummySwapsForRewards(this.alice);
    await this.reserveHelper.transferMoneyToReserve();

    await this.stake.accumulateRewards();
  });

  it("should not allow enter if not enough approve", async function () {
    await expect(
      this.stake.connect(this.alice).enter("100")
    ).to.be.revertedWith(
      "Money::transferFrom: transfer amount exceeds spender allowance"
    );
    await this.money.connect(this.alice).approve(this.stake.address, "50");
    await expect(
      this.stake.connect(this.alice).enter("100")
    ).to.be.revertedWith(
      "Money::transferFrom: transfer amount exceeds spender allowance"
    );
    await this.money.connect(this.alice).approve(this.stake.address, "100");
    await this.stake.connect(this.alice).enter("100");
    expect(await this.stake.balanceOf(this.alice.address)).to.equal("100");
  });

  it("should not allow withraw more than what you have", async function () {
    await this.money.approve(this.stake.address, "100");
    await this.stake.enter("100");
    await expect(this.stake.leave("200")).to.be.revertedWith(
      "ERC20: burn amount exceeds balance"
    );
  });

  it("should work with more than one participant", async function () {
    await this.money.connect(this.alice).approve(this.stake.address, "100");
    await this.money.connect(this.bob).approve(this.stake.address, "100");

    // Alice enters and gets 20 shares. Bob enters and gets 10 shares.
    await this.stake.connect(this.alice).enter("20");
    await this.stake.connect(this.bob).enter("10");

    expect(await this.stake.balanceOf(this.alice.address)).to.equal("20");
    expect(await this.stake.balanceOf(this.bob.address)).to.equal("10");
    expect(await this.money.balanceOf(this.stake.address)).to.equal("30");

    // Staking get 20 more MONEYs from an external source.
    await this.money.connect(this.carol).transfer(this.stake.address, "20");

    // Alice deposits 10 more MONEYs. She should receive 10*30/50 = 6 shares.
    await this.stake.connect(this.alice).enter("10");
    expect(await this.stake.balanceOf(this.alice.address)).to.equal("26");
    expect(await this.stake.balanceOf(this.bob.address)).to.equal("10");

    // Bob withdraws 5 shares. He should receive 5*60/36 = 8 shares
    await this.stake.connect(this.bob).leave("5");

    expect(await this.stake.balanceOf(this.alice.address)).to.equal("26");
    expect(await this.stake.balanceOf(this.bob.address)).to.equal("5");
    expect(await this.money.balanceOf(this.stake.address)).to.equal("52");
    expect(await this.money.balanceOf(this.alice.address)).to.equal("70");
    expect(await this.money.balanceOf(this.bob.address)).to.equal("98");
  });

  it("should set reserve address", async function () {
    const newReserve = this.signers[5].address;
    await expect(
      this.stake.connect(this.alice).setReserveAddress(newReserve)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(this.stake.setReserveAddress(ADDRESS_ZERO)).to.be.revertedWith(
      "Staking:setReserveAddress:: ERR_ZERO_ADDRESS"
    );

    await this.stake.setReserveAddress(newReserve);
    expect(await this.stake.reserve()).to.equal(newReserve);
  });
});
