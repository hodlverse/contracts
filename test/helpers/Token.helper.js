const config = require("../config");
const { deploy } = require("../utilities/deploy");

class Token {
  constructor(_admin) {
    this.admin = _admin;
  }

  async init() {
    this.moneyToken = await deploy("MoneyToken", [], { from: this.admin });
    await this.moneyToken.__MoneyToken_init();

    this.wethToken = await deploy("WETH9", [], {});

    return {
      moneyToken: this.moneyToken,
      wethToken: this.wethToken,
    };
  }

  async deployERC(decimals = 18, deployer = this.admin) {
    return await deploy(
      "ERC20Mock",
      [
        config.ercTokenName,
        config.ercTokenSymbol,
        decimals,
        config.ercTokenSupply,
      ],
      { from: deployer }
    );
  }

  async deployERC1155(deployer = this.admin) {
    return await deploy("GoldenNFTMock", [], { from: deployer });
  }

  // transferring tokens from admin to other wallets
  async getToken(contractInstance, toAccount, amount) {
    await contractInstance.connect(this.admin).transfer(toAccount, amount);
  }
}

module.exports = Token;
