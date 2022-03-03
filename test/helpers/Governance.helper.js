const { delay } = require("../config");
const Token = require("./Token.helper");

class Governance {
  constructor(_admin) {
    this.admin = _admin;
    this.tokenHelper = new Token(this.admin);
  }

  async init() {
    const { moneyToken } = await this.tokenHelper.init();

    this.time = await deploy("Time", [this.admin.address, delay]);
    this.governance = await deploy("HODLGovernor", []);
    this.governance.initialize(moneyToken.address, this.time.address);

    return {
      moneyToken,
      time: this.time,
      governance: this.governance,
    };
  }
}

module.exports = Governance;
