const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const Reserves = require("./helpers/Reserve.helper");
const { ADDRESS_ZERO } = require("./utilities");
const { solidity } = waffle;
use(solidity);

const { advanceBlockTo, duration, increase } = require("./utilities/time");

describe("Farming", function () {
  const reserveDistributionSchedule = 3000;
  const depositPeriod = 2000;

  before(async function () {
    this.signers = await ethers.getSigners();
    this.owner = this.signers[0];
    this.bob = this.signers[1];
    this.carol = this.signers[2];
    this.alice = this.signers[3];

    this.FarmFactory = await ethers.getContractFactory("FarmFactory");
    this.Farm = await ethers.getContractFactory("Farm");
    this.ERC20Mock = await ethers.getContractFactory("ERC20Mock");

    this.reserveHelper = new Reserves(this.owner);
  });

  beforeEach(async function () {
    const { moneyToken, buyback, reserve } = await this.reserveHelper.init();
    this.money = moneyToken;
    this.buyback = buyback;
    this.reserve = reserve;

    this.farmFactory = await this.FarmFactory.deploy(
      this.money.address,
      this.buyback.address,
      this.reserve.address,
      reserveDistributionSchedule,
      depositPeriod
    );

    await this.farmFactory.deployed();
    await this.reserve.addWithdrawers(
      [this.farmFactory.address, this.owner.address],
      [50, 50]
    );

    await this.money.transfer(this.alice.address, "100");
    await this.money.transfer(this.bob.address, "100");
    await this.money.transfer(this.carol.address, "100");
  });

  context("Farm factory", function () {
    it("should set correct state variables", async function () {
      const money = await this.farmFactory.money();
      const owner = await this.farmFactory.owner();
      const moneyOwner = await this.money.owner();

      expect(money).to.equal(this.money.address);
      expect(owner).to.equal(this.owner.address);
      expect(moneyOwner).to.equal(this.owner.address);
    });

    it("should allow dev and only dev to update dev", async function () {
      await expect(
        this.farmFactory.connect(this.bob).transferOwnership(this.bob.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await this.farmFactory
        .connect(this.owner)
        .transferOwnership(this.bob.address);
      expect(await this.farmFactory.owner()).to.equal(this.bob.address);
    });

    it("should update FeeAddress", async function () {
      const newFeeAddress = this.signers[3].address;
      await expect(
        this.farmFactory.connect(this.alice).setFeeAddress(newFeeAddress)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await this.farmFactory.setFeeAddress(newFeeAddress);
      expect(await this.farmFactory.feeAddress()).to.equal(newFeeAddress);
    });

    it("should update ReserveAddress", async function () {
      const newReserveAddress = this.signers[3].address;
      await expect(
        this.farmFactory
          .connect(this.alice)
          .setReserveAddress(newReserveAddress)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await this.farmFactory.setReserveAddress(newReserveAddress);
      expect(await this.farmFactory.reserve()).to.equal(newReserveAddress);
    });

    it("should update ReserveDistributionSchedule", async function () {
      const newReserveDistributionSchedule = this.signers[3].address;
      await expect(
        this.farmFactory
          .connect(this.alice)
          .updateReserveDistributionSchedule(newReserveDistributionSchedule)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await this.farmFactory.updateReserveDistributionSchedule(
        newReserveDistributionSchedule
      );
      expect(await this.farmFactory.reserveDistributionSchedule()).to.equal(
        newReserveDistributionSchedule
      );
    });

    context("With ERC/LP token added to the field", function () {
      beforeEach(async function () {
        this.lp = await this.ERC20Mock.deploy(
          "LPToken",
          "LP",
          18,
          "10000000000"
        );

        await this.lp.transfer(this.alice.address, "100");
        await this.lp.transfer(this.bob.address, "100");
        await this.lp.transfer(this.carol.address, "100");

        this.lp2 = await this.ERC20Mock.deploy(
          "LPToken2",
          "LP2",
          18,
          "10000000000"
        );

        await this.lp2.transfer(this.alice.address, "100");
        await this.lp2.transfer(this.bob.address, "100");
        await this.lp2.transfer(this.carol.address, "100");
      });

      it("should add new farm", async function () {
        await expect(
          this.farmFactory.connect(this.alice).add("100", this.lp.address, 0)
        ).to.be.revertedWith("Ownable: caller is not the owner");

        await expect(
          this.farmFactory.add("100", this.lp.address, 20000)
        ).to.be.revertedWith("FarmFactory:add:: INVALID_FEE_BASIS_POINTS");

        await expect(
          this.farmFactory.add("0", this.lp.address, 0)
        ).to.be.revertedWith("FarmFactory:add:: INVALID_ALLOC_POINTS");

        await expect(
          this.farmFactory.add("100", ADDRESS_ZERO, 0)
        ).to.be.revertedWith("FarmFactory:add:: INVALID_LP_TOKEN");

        // 100 per block farming rate starting at block 100 with bonus until block 1000
        await this.farmFactory.add("100", this.lp.address, 0);

        const farmAddress = await this.farmFactory.farms(1);
        expect(farmAddress).to.not.equal(ADDRESS_ZERO);
      });

      it("should update farm", async function () {
        await expect(
          this.farmFactory.connect(this.alice).set(1, 10, 100)
        ).to.be.revertedWith("Ownable: caller is not the owner");

        // 100 per block farming rate starting at block 100 with bonus until block 1000
        await this.farmFactory.add("100", this.lp.address, 0);
        await this.farmFactory.set(1, 10, 100);
      });

      it("should pull rewards", async function () {
        await expect(this.farmFactory.pullRewards()).to.be.revertedWith(
          "Reserve:withdrawRewards:: ERR_NO_REWARDS"
        );

        await advanceBlockTo(10000);
        await this.reserveHelper.dummySwapsForRewards(this.alice);
        await this.reserveHelper.transferMoneyToReserve();

        await this.farmFactory.pullRewards();

        const rewards = await this.farmFactory.getRewards(0);
        expect(rewards).to.be.not.equal("0");
      });
    });
  });

  context("Farm", function () {
    beforeEach(async function () {
      this.lp = await this.ERC20Mock.deploy("LPToken", "LP", 18, "10000000000");

      await this.lp.transfer(this.alice.address, "100");
      await this.lp.transfer(this.bob.address, "100");
      await this.lp.transfer(this.carol.address, "100");

      this.lp2 = await this.ERC20Mock.deploy(
        "LPToken2",
        "LP2",
        18,
        "10000000000"
      );

      await this.lp2.transfer(this.alice.address, "100");
      await this.lp2.transfer(this.bob.address, "100");
      await this.lp2.transfer(this.carol.address, "100");

      await this.farmFactory.add("100", this.lp.address, 0);

      const farmAddress = await this.farmFactory.farms(1);
      this.farm = await this.Farm.attach(farmAddress);
    });

    it("should allow deposit", async function () {
      const initialDeposits = await this.farm.getPoolDeposits(0);
      expect(initialDeposits).to.be.equal("0");

      await this.lp.connect(this.bob).approve(this.farm.address, "100");
      await this.farm.connect(this.bob).deposit("10");
      await advanceBlockTo("89");

      await this.farm.connect(this.bob).deposit("0");
      await advanceBlockTo("94");

      const deposits0 = await this.farm.getPoolDeposits(0);
      expect(deposits0).to.be.equal("10");

      await increase(duration.seconds(2000));
      await this.farm.connect(this.bob).deposit("50");
      await advanceBlockTo("100");

      const deposits1 = await this.farm.getPoolDeposits(1);
      expect(deposits1).to.be.equal("60");

      await increase(duration.seconds(3000));
      await this.farm.connect(this.bob).deposit("30");

      const deposits2 = await this.farm.getPoolDeposits(2);
      expect(deposits2).to.be.equal("90");
    });

    it("should allow deposit with fees", async function () {
      await this.lp.connect(this.bob).approve(this.farm.address, "100");
      await this.farmFactory.set(1, 10, 100);

      await this.farm.connect(this.bob).deposit("10");
    });

    it("should allow deposit with pending rewards", async function () {
      await this.lp.connect(this.bob).approve(this.farm.address, "100");
      await this.farm.connect(this.bob).deposit("10");
    });

    it("should allow withdrawals", async function () {
      await this.lp.connect(this.bob).approve(this.farm.address, "100");
      await this.farm.connect(this.bob).deposit("10");

      await increase(duration.seconds(5000));

      const moneyPerShare = await this.farm.getMoneyPerShare(0);
      expect(moneyPerShare).to.be.equal("0");

      await this.reserveHelper.dummySwapsForRewards(this.alice);
      await this.reserveHelper.transferMoneyToReserve();
      await this.farmFactory.pullRewards();

      await this.farm.updatePool();

      const moneyPerShareAfter = await this.farm.getMoneyPerShare(0);
      expect(moneyPerShareAfter.toString()).to.be.equal("2343700000000000");

      const pendingMoney = await this.farm.pendingMoney(this.bob.address);
      const initialMoneyBalance = await this.money.balanceOf(this.bob.address);

      await this.farm.withdrawFor(this.bob.address, "0");

      expect(await this.money.balanceOf(this.bob.address)).to.be.equal(
        pendingMoney.add(initialMoneyBalance)
      );
    });


  });
});
