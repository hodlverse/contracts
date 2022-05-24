const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
use(solidity);

const Token = require("./helpers/Token.helper");

const { BigNumber } = require("ethers");

describe("MoneyToken", function () {
  let name, delegatee;
  const chainId = 1;

  beforeEach(async function () {
    this.signers = await ethers.getSigners();
    this.owner = this.signers[1];
    this.bob = this.signers[1];
    this.carol = this.signers[2];
    this.alice = this.signers[3];

    const tokenHelper = new Token(this.owner);
    const { moneyToken } = await tokenHelper.init();
    this.money = moneyToken;

    name = await this.money.name();
    delegatee = this.owner.address;
  });

  describe("delegateBySig", function () {
    const Domain = (money) => ({
      name,
      chainId,
      verifyingContract: money.address,
    });

    const Types = {
      Delegation: [
        { name: "delegatee", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
      ],
    };

    const nonce = BigNumber.from("1");
    const expiry = BigNumber.from("0");

    it("reverts if the signatory is invalid", async function () {
      await expect(
        this.money.delegateBySig(
          delegatee,
          nonce,
          expiry,
          0,
          "0xabcd",
          "0xabcd"
        )
      ).to.be.reverted;
    });
  });

  it("should have correct name and symbol and decimal", async function () {
    const name = await this.money.name();
    const symbol = await this.money.symbol();
    const decimals = await this.money.decimals();
    expect(name, "MoneyToken");
    expect(symbol, "MONEY");
    expect(decimals, "18");
  });

  it("should supply token transfers properly", async function () {
    await this.money.transfer(this.bob.address, "1000");
    await this.money.transfer(this.carol.address, "10");
    await this.money.connect(this.bob).transfer(this.carol.address, "100", {
      from: this.bob.address,
    });
    const totalSupply = await this.money.totalSupply();
    const bobBal = await this.money.balanceOf(this.bob.address);
    const carolBal = await this.money.balanceOf(this.carol.address);
    expect(totalSupply, "5000000000000000000000000000");
    expect(bobBal, "900");
    expect(carolBal, "110");
  });

  it("should fail if you try to do bad transfers", async function () {
    await expect(
      this.money.connect(this.bob).transfer(this.carol.address, "110")
    ).to.be.revertedWith(
      "Money::_transferTokens: transfer amount exceeds balance"
    );
    await expect(
      this.money
        .connect(this.bob)
        .transfer(this.carol.address, "1", { from: this.bob.address })
    ).to.be.revertedWith(
      "Money::_transferTokens: transfer amount exceeds balance"
    );
  });

  it("should allow transfer from one wallet to other by third wallet", async function () {
    await this.money.transfer(this.bob.address, "110");
    await expect(
      this.money
        .connect(this.alice)
        .transferFrom(this.bob.address, this.carol.address, "110")
    ).to.be.revertedWith(
      "Money::transferFrom: transfer amount exceeds spender allowance"
    );

    await this.money.connect(this.bob).approve(this.alice.address, "110");

    const allowance = await this.money.allowance(
      this.bob.address,
      this.alice.address
    );

    expect(allowance).to.be.equal("110");

    await this.money
      .connect(this.alice)
      .transferFrom(this.bob.address, this.carol.address, "110");
  });

  it("should burn", async function () {
    await this.money.transfer(this.bob.address, "110");

    await expect(this.money.connect(this.bob).burn("110")).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
    await this.money.burn("100");
  });

  it("should get current and prior votes", async function () {
    await this.money.getCurrentVotes(this.bob.address);
    await this.money.getPriorVotes(this.bob.address, 5);
  });

  it("should delegate", async function () {
    await this.money.transfer(this.bob.address, "10000");
    await this.money.transfer(this.carol.address, "10000");

    await this.money.delegate(this.alice.address);
  });
});
