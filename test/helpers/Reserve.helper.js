const Pairs = require("./Pair.helper");
const { deploy } = require("../utilities/deploy");
const { MAX_INT } = require("../utilities");

class Reserves extends Pairs {
  constructor(_admin) {
    super(_admin);
    this.admin = _admin;
  }

  async init() {
    const { moneyToken, wethToken, goldenTicket, factory, router } =
      await super.init();

    this.buyback = await deploy("Buyback", [
      router.address,
      moneyToken.address,
    ]);
    await super.setBuyback(this.buyback.address);

    this.reserve = await deploy("Reserve", [
      moneyToken.address,
      this.buyback.address,
    ]);
    await this.buyback.setReserve(this.reserve.address);

    return {
      moneyToken,
      wethToken,
      goldenTicket,
      factory,
      router,
      buyback: this.buyback,
      reserve: this.reserve,
    };
  }

  async swapTokens(token, path, minOut = 1) {
    await this.buyback.swapTokens(minOut, token, path);
    this.transferMoneyToReserve();
  }

  async transferMoneyToReserve() {
    await this.buyback.transferMoneyToReserve();
  }

  async removeLiquidity(token0, token1, minToken0Out, minToken1Out) {
    await this.buyback.removeLiquidity(
      token0,
      token1,
      minToken0Out,
      minToken1Out
    );
  }

  async addWithdrawers(withdrawers, proportions) {
    await this.reserve.setReserve(withdrawers, proportions);
  }

  async dummySwapsForRewards(user) {
    await this.moneyToken.transfer(user.address, "10000000000000000000000");
    await this.addLiquidityETH(
      user,
      this.moneyToken,
      "100000000000000000",
      "100000000000000000"
    );

    await this.moneyToken
      .connect(user)
      .approve(this.router.address, "10000000000000");

    await this.swapTokensForExactETH(
      user,
      [this.moneyToken.address, this.wethToken.address],
      "1000000",
      MAX_INT
    );

    await this.swapTokensForExactETH(
      user,
      [this.moneyToken.address, this.wethToken.address],
      "1000000",
      MAX_INT
    );

    await this.swapTokensForExactETH(
      user,
      [this.moneyToken.address, this.wethToken.address],
      "1000000",
      MAX_INT
    );
  }
}

module.exports = Reserves;
