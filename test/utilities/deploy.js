const { ethers } = require("hardhat");

const deploy = async (ContractName, args, overrides) => {
  this.Contract = await ethers.getContractFactory(ContractName);
  this.contract = await this.Contract.deploy(...args, overrides);
  return this.contract;
};

module.exports = deploy;
