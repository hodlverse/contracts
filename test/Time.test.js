const { use, expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { solidity } = waffle;
use(solidity);

const { latest, increase, duration } = require("./utilities/time");
const {
  encodeParameters,
  etherUnsigned,
  freezeTime,
  keccak256,
} = require("./utilities");
const Governance = require("../test/helpers/Governance.helper");

const oneWeekInSeconds = etherUnsigned(7 * 24 * 60 * 60);
const zero = etherUnsigned(0);
const gracePeriod = oneWeekInSeconds.mul(2);

describe("Time", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.alice = this.signers[0];
    this.bob = this.signers[1];
    this.carol = this.signers[2];
  });

  beforeEach(async function () {
    const governanceHelper = new Governance(this.alice);
    const { moneyToken, time } = await governanceHelper.init();

    this.money = moneyToken;
    this.time = time;
  });

  describe("constructor", () => {
    it("sets address of admin", async () => {
      let configuredAdmin = await this.time.admin();

      expect(configuredAdmin).toEqual(root);
    });

    it("sets delay", async () => {
      let configuredDelay = await this.time.delay();
      expect(configuredDelay).toEqual(delay.toString());
    });
  });

  // it("should not allow non-owner to do operation", async function () {
  //   await this.money.transferOwnership(this.time.address, true, false);
  //   // await expectRevert(this.money.transferOwnership(carol, { from: alice }), "Ownable: caller is not the owner")

  //   await expect(
  //     this.money.transferOwnership(this.carol.address, true, false)
  //   ).to.be.revertedWith("Ownable: caller is not the owner");

  //   await expect(
  //     this.money
  //       .connect(this.bob)
  //       .transferOwnership(this.carol.address, true, false)
  //   ).to.be.revertedWith("Ownable: caller is not the owner");

  //   await expect(
  //     this.time.queueTransaction(
  //       this.money.address,
  //       "0",
  //       "transferOwnership(address,bool,bool)",
  //       encodeParameters(
  //         ["address", "bool", "bool"],
  //         [this.carol.address, true, false]
  //       ),
  //       (await latest()).add(duration.days(4))
  //     )
  //   ).to.be.revertedWith("Time::queueTransaction: Call must come from owner.");
  // });

  // it("should do the time thing", async function () {
  //   await this.money.transferOwnership(this.time.address, true, false);
  //   const eta = (await latest()).add(duration.days(4));
  //   await this.time
  //     .connect(this.bob)
  //     .queueTransaction(
  //       this.money.address,
  //       "0",
  //       "transferOwnership(address,bool,bool)",
  //       encodeParameters(
  //         ["address", "bool", "bool"],
  //         [this.carol.address, true, false]
  //       ),
  //       eta
  //     );
  //   await increase(duration.days(1));
  //   await expect(
  //     this.time
  //       .connect(this.bob)
  //       .executeTransaction(
  //         this.money.address,
  //         "0",
  //         "transferOwnership(address,bool,bool)",
  //         encodeParameters(
  //           ["address", "bool", "bool"],
  //           [this.carol.address, true, false]
  //         ),
  //         eta
  //       )
  //   ).to.be.revertedWith(
  //     "Time::executeTransaction: Transaction hasn't surpassed time lock."
  //   );
  //   await increase(duration.days(4));
  //   await this.time
  //     .connect(this.bob)
  //     .executeTransaction(
  //       this.money.address,
  //       "0",
  //       "transferOwnership(address,bool,bool)",
  //       encodeParameters(
  //         ["address", "bool", "bool"],
  //         [this.carol.address, true, false]
  //       ),
  //       eta
  //     );
  //   expect(await this.money.owner()).to.equal(this.carol.address);
  // });
});
