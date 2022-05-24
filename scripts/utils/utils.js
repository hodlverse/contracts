const fs = require("fs");

const { deployments, run } = require("hardhat");
const { deploy } = deployments;

const deployAndVerify = async (
  contractName,
  args,
  deployer,
  contractPath,
  chainId
) => {
  const contractInstance = await deploy(contractName, {
    from: deployer,
    args,
    log: true,
    deterministicDeployment: false,
  });

  console.log(`${contractName} deployed: ${contractInstance.address}`);
  console.log("verifying the contract:");

  try {
    if (chainId != 31337) {
      await sleep(30);
      await run("verify:verify", {
        address: contractInstance.address,
        contract: contractPath,
        constructorArguments: args,
      });
    }
  } catch (error) {
    console.log("Error during verification", error);
  }

  return contractInstance;
};

const printOwner = async (contracts) => {
  for (let index = 0; index < contracts.length; index++) {
    let owner;
    try {
      owner = await contracts[index].contract.owner();
    } catch (error) {
      owner = await contracts[index].contract.admin();
    }
    console.log(`Owner of ${contracts[index].name} is ${owner}`);
  }
};

const store = async (data, chainId) => {
  fs.writeFileSync(
    __dirname + `/../../deployments/addresses/${chainId}.json`,
    JSON.stringify(data)
  );
};

const sleep = (delay) =>
  new Promise((resolve) => setTimeout(resolve, delay * 1000));

module.exports = {
  deployAndVerify,
  printOwner,
  sleep,
  store,
};
