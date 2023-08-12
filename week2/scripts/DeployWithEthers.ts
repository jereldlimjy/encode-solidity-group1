import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config();

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}

async function main() {
  try {
    // get proposal names from command line arguments
    const proposals = process.argv.slice(2);

    if (proposals.length === 0) {
      throw new Error("No proposals given.");
    }

    console.log("Deploying Ballot contract...");
    console.log("Proposals: ");
    proposals.forEach((element, index) => {
      console.log(`\tProposal ${index + 1}: ${element}`);
    });
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

    const balanceBN = await provider.getBalance(wallet.address);
    const balance = Number(ethers.formatUnits(balanceBN));
    console.log("Wallet balance:", balance);

    // takes in a signer
    const ballotFactory = new Ballot__factory(wallet);
    const ballotContract = await ballotFactory.deploy(
      proposals.map(ethers.encodeBytes32String)
    );
    await ballotContract.waitForDeployment();

    console.log("Contract deployed!");

    const etherscanUrl = `https://sepolia.etherscan.io/address/${ballotContract.target}`;
    console.log("Etherscan URL:", etherscanUrl);
  } catch (err) {
    console.error("Failed to deploy contract:", (err as Error).message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
