require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
      },
    },
  },
  allowUnlimitedContractSize: true,
  networks: {
    hardhat: {},
    ETH_SEPOLIA: {
      accounts: [`${process.env.PRIVATE_KEY}`],
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    },
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
  paths: {
    artifacts: "../fronted/artifacts",
  },
};
