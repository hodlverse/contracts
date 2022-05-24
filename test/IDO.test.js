const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
const { BigNumber, utils } = require("ethers");
use(solidity);

const { advanceTimeAndBlock, latest } = require("./utilities/time");
const Token = require("./helpers/Token.helper");
const { expandToNDecimals, ADDRESS_ZERO, MAX_INT } = require("./utilities");

describe("Money IDO", function () {
  const usdtDecimals = 6;

  const endTimestamp = 60;
  const unlockTimestamp = 66;

  const expandToUSDT = (num) => expandToNDecimals(num, usdtDecimals);

  beforeEach(async function () {
    this.signers = await ethers.getSigners();
    this.owner = this.signers[0];
    this.withdrawer = this.signers[1];
    this.alice = this.signers[2];
    this.bob = this.signers[3];

    this.tokenHelper = new Token(this.owner);
    this.IDO = await ethers.getContractFactory("IDO");

    const { moneyToken } = await this.tokenHelper.init();
    this.money = moneyToken;

    this.usdt = await this.tokenHelper.deployERC(usdtDecimals);
    this.latestTimestamp = await latest();



    this.ido = await this.IDO.deploy(
      this.latestTimestamp, // sale start time
      this.latestTimestamp.add(endTimestamp), // sale end time = 1 hour + start time
      this.latestTimestamp.add(unlockTimestamp), // sale unlock time = 1 hour + end time
      expandToUSDT(10000), // sale cap = 10000 usdt
      expandToUSDT(1000), // deposit min = 1000 usdt
      expandToUSDT(2000), // deposit max = 2000 usdt
      BigNumber.from(10).pow(12).mul(1), // exchange rate (1 MONEY = 1 USDT)
      this.withdrawer.address,
      this.usdt.address,
      this.money.address
    );

    await this.usdt.transfer(this.alice.address, expandToUSDT("1000000"));
    await this.usdt.transfer(this.bob.address, expandToUSDT("1000000"));

    await this.money
      .connect(this.owner)
      .transfer(this.ido.address, BigNumber.from(10).pow(18).mul(10000));
  });

  it("should revert deployment with wrong params", async function () {
    await expect(
      this.IDO.deploy(
        this.latestTimestamp, // sale start time
        this.latestTimestamp.add(500), // sale end time = 1 hour + start time
        this.latestTimestamp.add(1000), // sale unlock time = 1 hour + end time
        expandToUSDT(10000), // sale cap = 10000 usdt
        expandToUSDT(1000), // deposit min = 1000 usdt
        expandToUSDT(2000), // deposit max = 2000 usdt
        0, // exchange rate (1 MONEY = 1 USDT)
        this.withdrawer.address,
        this.usdt.address,
        this.money.address
      )
    ).to.be.revertedWith("MoneyIDO: exchange rate cannot be zero");

    await expect(
      this.IDO.deploy(
        this.latestTimestamp, // sale start time
        this.latestTimestamp.add(500), // sale end time = 1 hour + start time
        this.latestTimestamp.add(1000), // sale unlock time = 1 hour + end time
        expandToUSDT(10000), // sale cap = 10000 usdt
        expandToUSDT(1000), // deposit min = 1000 usdt
        expandToUSDT(2000), // deposit max = 2000 usdt
        BigNumber.from(10).pow(12).mul(1), // exchange rate (1 MONEY = 1 USDT)
        ADDRESS_ZERO,
        this.usdt.address,
        this.money.address
      )
    ).to.be.revertedWith("MoneyIDO: Invalid withdrawer address.");
  });

  it("should set correct state variables", async function () {
    const owner = await this.ido.owner();
    expect(owner).to.equal(this.owner.address);

    const saleStartTime = await this.ido.saleStartTime();
    expect(saleStartTime.eq(this.latestTimestamp)).to.equal(true);
  });

  describe("should perform owner functions", async () => {
    it("should set sale start time", async function () {
      await expect(
        this.ido
          .connect(this.owner)
          .setSaleStartTime(this.latestTimestamp.add(1000))
      ).to.be.revertedWith("MoneyIDO: Invalid sale start time.");

      await expect(
        this.ido
          .connect(this.alice)
          .setSaleStartTime(this.latestTimestamp.add(100))
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await this.ido.setSaleStartTime(this.latestTimestamp);

      const saleStartTime = await this.ido.saleStartTime();
      expect(saleStartTime.eq(this.latestTimestamp)).to.equal(true);
    });

    it("should set sale end time", async function () {
      await expect(
        this.ido
          .connect(this.alice)
          .setSaleEndTime(this.latestTimestamp.add(10))
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        this.ido
          .connect(this.owner)
          .setSaleEndTime(this.latestTimestamp.sub(10))
      ).to.be.revertedWith("MoneyIDO: Invalid sale end time");

      await expect(
        this.ido
          .connect(this.owner)
          .setSaleEndTime(this.latestTimestamp.add(2000))
      ).to.be.revertedWith("MoneyIDO: Invalid sale end time");

      await this.ido
        .connect(this.owner)
        .setSaleEndTime(this.latestTimestamp.add(endTimestamp));

      const saleEndTime = await this.ido.saleEndTime();
      expect(saleEndTime.eq(this.latestTimestamp.add(endTimestamp))).to.equal(true);
    });

    it("should set withdrawer", async function () {
      await expect(
        this.ido.connect(this.alice).setWithdrawer(this.bob.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        this.ido.connect(this.owner).setWithdrawer(ADDRESS_ZERO)
      ).to.be.revertedWith("MoneyIDO: Invalid withdrawer address.");

      await this.ido.connect(this.owner).setWithdrawer(this.bob.address);

      const withdrawer = await this.ido.withdrawer();
      expect(withdrawer).to.be.eq(this.bob.address);
    });

    it("should set unlock time", async function () {
      await expect(
        this.ido
          .connect(this.alice)
          .setUnlockTime(this.latestTimestamp.add(10))
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        this.ido
          .connect(this.owner)
          .setUnlockTime(this.latestTimestamp.add(10))
      ).to.be.revertedWith("MoneyIDO: Invalid unlock time");

      await this.ido
        .connect(this.owner)
        .setUnlockTime(this.latestTimestamp.add(unlockTimestamp));

      const unlockTime = await this.ido.unlockTime();
      expect(unlockTime.eq(this.latestTimestamp.add(unlockTimestamp))).to.equal(true);
    });

    it("should set deposit min", async function () {
      await expect(
        this.ido
          .connect(this.alice)
          .setDepositMin(this.latestTimestamp.add(100))
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        this.ido.connect(this.owner).setDepositMin(MAX_INT)
      ).to.be.revertedWith("MoneyIDO: Invalid min deposit.");

      await this.ido.connect(this.owner).setDepositMin(expandToNDecimals(1000));

      const depositMin = await this.ido.depositMin();
      expect(depositMin.eq(expandToNDecimals(1000))).to.equal(true);
    });

    it("should set deposit max", async function () {
      await expect(
        this.ido.connect(this.alice).setDepositMax(expandToUSDT(1000))
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        this.ido.connect(this.owner).setDepositMax(0)
      ).to.be.revertedWith("MoneyIDO: Invalid max deposit");

      await this.ido.connect(this.owner).setDepositMax(expandToUSDT(1000));

      const depositMax = await this.ido.depositMax();
      expect(depositMax.eq(expandToUSDT(1000))).to.equal(true);
    });

    it("should pause the contract", async function () {
      await expect(this.ido.connect(this.alice).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );

      await this.ido.connect(this.owner).pause();

      const paused = await this.ido.paused();
      expect(paused).to.equal(true);

      await expect(this.ido.connect(this.owner).pause()).to.be.revertedWith(
        "Pausable: paused"
      );

      await expect(
        this.ido.connect(this.owner).deposit(expandToUSDT(1000))
      ).to.be.revertedWith("Pausable: paused");

      await expect(this.ido.connect(this.owner).claim()).to.be.revertedWith(
        "Pausable: paused"
      );

      await expect(this.ido.connect(this.owner).withdraw()).to.be.revertedWith(
        "Pausable: paused"
      );

      await expect(
        this.ido.connect(this.owner).withdrawRest()
      ).to.be.revertedWith("Pausable: paused");
    });

    it("should not pause after unlock time", async function () {
      await advanceTimeAndBlock(80);
      await expect(this.ido.connect(this.owner).pause()).to.be.revertedWith(
        "MoneyIDO: cannot be paused after unlock time"
      );
    });
  });

  it("should allow deposit between min and max amounts", async function () {
    await expect(this.ido.deposit(expandToUSDT("999"))).to.be.revertedWith(
      "MoneyIDO: Does not meet minimum deposit requirements."
    );
    await expect(this.ido.deposit(expandToUSDT("2001"))).to.be.revertedWith(
      "MoneyIDO: Does not meet maximum deposit requirements."
    );

    await this.usdt
      .connect(this.alice)
      .approve(this.ido.address, expandToUSDT("5000"));

    await this.ido.connect(this.alice).deposit(expandToUSDT("1500"));

    expect(await this.ido.balanceOf(this.alice.address)).to.equal(
      expandToUSDT("1500")
    );

    expect(await this.ido.totalUSDTBalance()).to.equal(expandToUSDT("1500"));

    await expect(
      this.ido.connect(this.alice).deposit(expandToUSDT("1500"))
    ).to.be.revertedWith(
      "MoneyIDO: Does not meet maximum deposit requirements."
    );
  });

  it("should reject deposit after achieve sale cap", async function () {
    for (let index = 0; index < 5; index++) {
      const depositor = this.signers[4 + index];
      const depositAmount = expandToUSDT("2000");

      await this.usdt
        .connect(this.owner)
        .transfer(depositor.address, depositAmount);
      await this.usdt
        .connect(depositor)
        .approve(this.ido.address, depositAmount);

      await this.ido.connect(depositor).deposit(depositAmount);
    }

    await this.usdt
      .connect(this.bob)
      .approve(this.ido.address, expandToUSDT("1000"));

    await expect(
      this.ido.connect(this.bob).deposit(expandToUSDT("1000"))
    ).to.be.revertedWith("MoneyIDO: Sale Cap overflow.");
  });

  it("should reject deposit after end of sale", async function () {
    await  advanceTimeAndBlock(80);
    await expect(this.ido.deposit(expandToUSDT("1500"))).to.be.revertedWith(
      "MoneyIDO: IDO is already finished."
    );
  });

  it("should be able to claim only after unlock period", async function () {
    await this.usdt
      .connect(this.alice)
      .approve(this.ido.address, expandToUSDT("2000"));

    await this.ido.connect(this.alice).deposit(expandToUSDT("2000"));

    await expect(this.ido.connect(this.alice).claim()).to.be.revertedWith(
      "MoneyIDO: IDO is not unlocked yet."
    );

    await advanceTimeAndBlock(80);
    await this.ido.connect(this.alice).claim();

    expect(await this.money.balanceOf(this.alice.address)).to.equal(
      utils.parseEther("2000")
    );
    await expect(this.ido.connect(this.alice).claim()).to.be.revertedWith(
      "MoneyIDO: Insufficient balance."
    );
  });

  it("should allow only withdrawer to withdraw usdt", async function () {
    await this.usdt
      .connect(this.alice)
      .approve(this.ido.address, expandToUSDT("2000"));

    await this.ido.connect(this.alice).deposit(expandToUSDT("2000"));
    await advanceTimeAndBlock(80);

    await expect(this.ido.connect(this.alice).withdraw()).to.be.revertedWith(
      "MoneyIDO: You can't withdraw funds."
    );

    await this.ido.connect(this.withdrawer).withdraw();

    expect(await this.usdt.balanceOf(this.withdrawer.address)).to.equal(
      expandToUSDT("2000")
    );
  });

  it("should allow only withdrawer to withdraw unsold MONEY tokens", async function () {
    await this.usdt
      .connect(this.alice)
      .approve(this.ido.address, expandToUSDT("2000"));

    await this.ido.connect(this.alice).deposit(expandToUSDT("2000"));

    await expect(
      this.ido.connect(this.withdrawer).withdrawRest()
    ).to.be.revertedWith("MoneyIDO: IDO is not unlocked yet.");

    await advanceTimeAndBlock(80);

    await expect(
      this.ido.connect(this.alice).withdrawRest()
    ).to.be.revertedWith("MoneyIDO: You can't withdraw funds.");

    await this.ido.connect(this.withdrawer).withdrawRest();

    // expect(await this.usdt.balanceOf(this.withdrawer.address)).to.equal(
    //   expandToUSDT("2000")
    // );
  });

  it("should allow emergencyWithdraw when contract is paused", async function () {
    await this.usdt
      .connect(this.alice)
      .approve(this.ido.address, expandToUSDT("2000"));

    await this.ido.connect(this.alice).deposit(expandToUSDT("2000"));

    await expect(
      this.ido.connect(this.alice).emergencyWithdraw()
    ).to.be.revertedWith("Pausable: not paused");

    await this.ido.connect(this.owner).pause();

    await this.ido.connect(this.withdrawer).emergencyWithdraw();
    await this.ido.connect(this.alice).emergencyWithdraw();

    await expect(
      this.ido.connect(this.bob).emergencyWithdraw()
    ).to.be.revertedWith(
      "MoneyIDO:emergencyWithdraw:: Insufficient USDT balance."
    );
  });
});
