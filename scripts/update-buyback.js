const { getNamedAccounts, getChainId, ethers } = require("hardhat");
const { deployAndVerify, printOwner } = require("./utils/utils");

const main = async () => {
  const namedAccounts = await getNamedAccounts();

  const { owner } = namedAccounts;
  const chainId = await getChainId();

  const router = await ethers.getContract("Router", owner);
  const money = await ethers.getContract("MoneyToken", owner);

  const buyback = await deployAndVerify(
    "Buyback",
    [router.address, money.address],
    owner,
    "contracts/Buyback.sol:Buyback",
    chainId
  );

  await setup(owner);

  // print address
  console.log(buyback.address);
};

const setup = async (owner) => {
  const factoryContract = await ethers.getContract("Factory", owner);
  const buybackContract = await ethers.getContract("Buyback", owner);
  const farmingContract = await ethers.getContract("Farming", owner);
  const reserveContract = await ethers.getContract("Reserve", owner);

  await factoryContract.setBuyback(buybackContract.address);
  await buybackContract.setReserve(reserveContract.address);
  await reserveContract.updateBuyback(buybackContract.address);
  await farmingContract.setFeeAddress(buybackContract.address);

  const contracts = [{ contract: buybackContract, name: "Buyback" }];

  await printOwner(contracts);
};

module.exports = main;
