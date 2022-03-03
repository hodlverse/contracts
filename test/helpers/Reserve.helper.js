const Pairs = require("./Pair.helper");

class Reserves {
  constructor(_admin) {
    this.admin = _admin;
    this.pairHelper = new Pairs(this.admin);
  }

  async init() {
    const { moneyToken, wethToken, goldenTicket, factory, router } =
      await this.pairHelper.init();

    this.buyback = await deploy("Buyback", [
      router.address,
      moneyToken.address,
    ]);

    await this.pairHelper.setBuyback(this.buyback.address);

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
}

module.exports = Reserves;
