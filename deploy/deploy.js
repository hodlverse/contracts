const { getNamedAccounts, getChainId, ethers } = require("hardhat");
const {
  deployAndVerify,
  printOwner,
  store,
} = require("../scripts/utils/utils");

const oldRouterAddress = "0x4542FAfB2b6a10404F37aE3EC889055663Cb7e5b"; //SUSHI Router
const daoAddress = "0x672FD76C6cB08b74ba0dB4b936280Cda05e5eB26"; //owner
const owner = "0x672FD76C6cB08b74ba0dB4b936280Cda05e5eB26";
const proportions = [60, 30, 10];
const required = 1;
const delay = 10 * 24 * 60 * 60; //10 days
const reserveDistributionSchedule = 30 * 24 * 60 * 60; //30 days
const depositPeriod = 24 * 60 * 60; // 24 hours
const goldenTicketId = 1;

const main = async () => {
  const namedAccounts = await getNamedAccounts();
  const { deployer } = namedAccounts;
  const owners = [owner];

  const chainId = await getChainId();
  const weth = await deployAndVerify(
    "WETH9",
    [],
    deployer,
    "contracts/mocks/WETH9.sol:WETH9",
    chainId
  );

  // Money contract
  // makes owner passed as contract owner too
  const money = await deployAndVerify(
    "MoneyToken",
    [],
    deployer,
    "contracts/MoneyToken.sol:MoneyToken",
    chainId
  );

  const goldenTicketNFT = await deployAndVerify(
    "GoldenNFTMock",
    [],
    deployer,
    "contracts/mocks/GoldenNFTMock.sol:GoldenNFTMock",
    chainId
  );

  const multisigWallet = await deployAndVerify(
    "MultiSigWallet",
    [owners, required],
    deployer,
    "contracts/MultiSigWallet.sol:MultiSigWallet",
    chainId
  );

  const time = await deployAndVerify(
    "Time",
    [owner, delay],
    deployer,
    "contracts/Time.sol:Time",
    chainId
  );

  // AMM
  const factory = await deployAndVerify(
    "Factory",
    [money.address, goldenTicketNFT.address, goldenTicketId],
    deployer,
    "contracts/pairs/Factory.sol:Factory",
    chainId
  );

  const router = await deployAndVerify(
    "Router",
    [factory.address, weth.address],
    deployer,
    "contracts/pairs/Router.sol:Router",
    chainId
  );

  const migrator = await deployAndVerify(
    "Migrator",
    [oldRouterAddress, router.address],
    deployer,
    "contracts/Migrator.sol:Migrator",
    chainId
  );

  // Fee management
  const buyback = await deployAndVerify(
    "Buyback",
    [router.address, money.address],
    deployer,
    "contracts/Buyback.sol:Buyback",
    chainId
  );

  const reserve = await deployAndVerify(
    "Reserve",
    [money.address, buyback.address],
    deployer,
    "contracts/Reserve.sol:Reserve",
    chainId
  );

  // Farming and staking
  const farming = await deployAndVerify(
    "FarmFactory",
    [
      money.address,
      buyback.address,
      reserve.address,
      reserveDistributionSchedule,
      depositPeriod,
    ],
    deployer,
    "contracts/farm/FarmFactory.sol:FarmFactory",
    chainId
  );

  const staking = await deployAndVerify(
    "Staking",
    [money.address, reserve.address],
    deployer,
    "contracts/Staking.sol:Staking",
    chainId
  );

  const withdrawers = [farming.address, staking.address, daoAddress];
  await setup(withdrawers, proportions, owner, deployer);

  // store address
  let addresses = {
    weth: weth.address,
    money: money.address,
    multisigWallet: multisigWallet.address,
    time: time.address,
    farming: farming.address,
    staking: staking.address,
    buyback: buyback.address,
    reserve: reserve.address,
    factory: factory.address,
    router: router.address,
    migrator: migrator.address,
  };

  await store(addresses, chainId);
};

const setup = async (withdrawers, proportions, owner, deployer) => {
  const moneyContract = await ethers.getContract("MoneyToken", deployer);
  const timeContract = await ethers.getContract("Time", deployer);
  const factoryContract = await ethers.getContract("Factory", deployer);
  const buybackContract = await ethers.getContract("Buyback", deployer);
  const stakingContract = await ethers.getContract("Staking", deployer);
  const farmingContract = await ethers.getContract("FarmFactory", deployer);
  const reserveContract = await ethers.getContract("Reserve", deployer);

  await factoryContract.setBuyback(buybackContract.address);
  await buybackContract.setReserve(reserveContract.address);
  await reserveContract.addWithdrawers(withdrawers, proportions);

  await factoryContract.setOwner(owner);
  await buybackContract.transferOwnership(owner);
  await stakingContract.transferOwnership(owner);
  await farmingContract.transferOwnership(owner);
  await reserveContract.transferOwnership(owner);

  await moneyContract.__MoneyToken_init();

  const contracts = [
    { contract: moneyContract, name: "Money" },
    { contract: timeContract, name: "Time" },
    { contract: factoryContract, name: "Factory" },
    { contract: buybackContract, name: "Buyback" },
    { contract: stakingContract, name: "Staking" },
    { contract: farmingContract, name: "FarmFactory" },
    { contract: reserveContract, name: "Reserve" },
  ];

  await printOwner(contracts);
};

module.exports = main;
