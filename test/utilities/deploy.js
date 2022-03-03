const { ethers } = require("hardhat");

const deploy = async (ContractName, args=[], overrides) => {
  this.Contract = await ethers.getContractFactory(ContractName);
  this.contract = await this.Contract.deploy(...args);
  return this.contract;
};

const attach = async (ContractName, address) => {
  this.Contract = await ethers.getContractFactory(ContractName);
  this.contract = await this.Contract.attach(address);
  return this.contract;
};

module.exports = {
  deploy,
  attach
};
