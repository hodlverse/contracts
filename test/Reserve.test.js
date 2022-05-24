const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
use(solidity);

const ReserveHelper = require("./helpers/Reserve.helper");
const { ADDRESS_ZERO } = require("./utilities");

describe("Reserve", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.owner = this.signers[0];
    this.alice = this.signers[1];
    this.bob = this.signers[2];
    this.carol = this.signers[3];

    this.reserveHelper = new ReserveHelper(this.owner);
  });

  beforeEach(async function () {
    const { moneyToken, buyback, reserve } = await this.reserveHelper.init();
    this.money = moneyToken;
    this.buyback = buyback;
    this.reserve = reserve;
  });

  it("should update Buyback", async function () {
    const newBuyback = this.signers[3].address;
    await expect(this.reserve.updateBuyback(ADDRESS_ZERO)).to.be.revertedWith(
      "Reserve:updateBuyback:: ERR_ZERO_ADDRESS"
    );

    await this.reserve.updateBuyback(newBuyback);
    expect(await this.reserve.buyback()).to.equal(newBuyback);
  });

  it("should update Money", async function () {
    const newMoney = this.signers[3].address;
    await expect(this.reserve.updateMoney(ADDRESS_ZERO)).to.be.revertedWith(
      "Reserve:updateMoney:: ERR_ZERO_ADDRESS"
    );

    await this.reserve.updateMoney(newMoney);
    expect(await this.reserve.money()).to.equal(newMoney);
  });

  it("should add and update withdrawers", async function () {
    await expect(
      this.reserve.addWithdrawers([this.alice.address, this.bob.address], [50])
    ).to.be.revertedWith("Reserve:addWithdrawers:: ERR_INVALID_ARRAY_LENGTHS");

    await expect(
      this.reserve.addWithdrawers([ADDRESS_ZERO, this.bob.address], [50, 50])
    ).to.be.revertedWith("Reserve:_addWithdrawer:: ERR_INVALID_ADDRESS");

    await this.reserve.addWithdrawers(
      [this.alice.address, this.bob.address],
      [50, 50]
    );

    await expect(
      this.reserve.updateWithdrawer(this.alice.address, this.bob.address)
    ).to.be.revertedWith("Reserve:updateWithdrawer:: ERR_WITHDRAWER");

    await this.reserve.updateWithdrawer(this.alice.address, this.carol.address);
  });
});
