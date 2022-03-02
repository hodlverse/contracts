const { ethers } = require("hardhat");
const Token = require("./Token.helper");

class Pairs {
  constructor(_admin, _investor) {
    this.admin = _admin;
    this.tokenHelper = new Token(this.admin);
  }

  async init() {
    const { moneyToken, wethToken } = await this.tokenHelper.init();
    const goldenTicket = await this.tokenHelper.deployERC1155();

    this.factory = await deploy("Factory", [
      moneyToken.address,
      goldenTicket.address,
      await goldenTicket.GOLDEN_TICKET_ID(),
    ]);

    this.router = await deploy("Router", [
      this.factory.address,
      wethToken.address,
    ]);

    return {
      moneyToken,
      wethToken,
      goldenTicket,
      factory: this.factory,
      router: this.router,
    };
  }

  async createPair(token0, token1) {
    await this.factory.createPair(token0.address, token1.address);
    return await this.factory.getPair(token0.address, token1.address);
  }

  async addLiquidity(user, token0, token1, amount0, amount1) {
    await token0.connect(user).approve(this.router.address, amount0);
    await token1.connect(user).approve(this.router.address, amount1);

    await this.router
      .connect(user)
      .addLiquidity(
        token0.address,
        token1.address,
        amount0,
        amount1,
        1,
        1,
        user.address,
        new Date().getTime()
      );
  }

  async addLiquidityETH(user, token, amount, ethAmount) {
    await token.connect(user).approve(this.router.address, amount);

    await this.router
      .connect(user)
      .addLiquidityETH(
        token.address,
        amount,
        1,
        1,
        user.address,
        new Date().getTime(),
        {
          value: ethAmount,
        }
      );
  }

  async removeLiquidity(
    user,
    token0,
    token1,
    amountOut,
    inETH = false,
    minOut0 = 1,
    minOut1 = 1
  ) {
    const lpTokenAddress = await this.factory.getPair(
      token0.address,
      token1.address
    );

    const HVLPToken = await ethers.getContractFactory("HVLPToken");
    const lpToken = HVLPToken.attach(lpTokenAddress);
    await lpToken.connect(user).approve(this.router.address, amountOut);

    if (!inETH) {
      await this.router
        .connect(user)
        .removeLiquidity(
          token0.address,
          token1.address,
          amountOut,
          minOut0,
          minOut1,
          user.address,
          new Date().getTime()
        );
    } else {
      await this.router
        .connect(user)
        .removeLiquidityETH(
          token0.address,
          amountOut,
          minOut0,
          minOut1,
          user.address,
          new Date().getTime()
        );
    }
  }

  async swapExactTokensForTokens(user, path, swapAmount, minOut = 1) {
    await this.router
      .connect(user)
      .swapExactTokensForTokens(
        swapAmount,
        minOut,
        path,
        user.address,
        new Date().getTime()
      );
  }

  async swapTokensForExactTokens(user, path, expectedOut, minAmountIn = 1) {
    await this.router
      .connect(user)
      .swapTokensForExactTokens(
        minAmountIn,
        expectedOut,
        path,
        user.address,
        new Date().getTime()
      );
  }

  async swapExactETHForTokens(user, path, ethAmount, minOut = 1) {
    await this.router
      .connect(user)
      .swapExactETHForTokens(minOut, path, user.address, new Date().getTime(), {
        value: ethAmount,
      });
  }

  async swapTokensForExactETH(user, path, ethAmountOut, expectedIn = 1) {
    await this.router
      .connect(user)
      .swapTokensForExactETH(
        expectedIn,
        ethAmountOut,
        path,
        user.address,
        new Date().getTime()
      );
  }

  async swapExactTokensForETH(user, path, swapAmount, minOut = 1) {
    await this.router
      .connect(user)
      .swapExactTokensForETH(
        swapAmount,
        minOut,
        path,
        user.address,
        new Date().getTime()
      );
  }

  async swapETHForExactTokens(user, path, ethSwapAmount, minOut = 1) {
    await this.router
      .connect(user)
      .swapETHForExactTokens(minOut, path, user.address, new Date().getTime(), {
        value: ethSwapAmount,
      });
  }
}

module.exports = Pairs;
