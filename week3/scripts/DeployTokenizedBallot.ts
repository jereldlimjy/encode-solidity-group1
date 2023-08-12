import { ethers } from "ethers";
import {
  VoteToken__factory,
  TokenizedBallot__factory,
} from "../typechain-types";
import * as dotenv from "dotenv";
import mintAndDelegate from "./utils/mintAndDelegate";
import setupProvider from "./utils/setupProvider";

dotenv.config();

const PROPOSALS = ["Pikachu", "Squirtle", "Bulbasaur", "Charmander"];
const WALLETS = [
  {
    address: "0xE8bA93f3Caa61CE2cd0D3d52A22365f96A97e26D",
    privateKey: process.env.PRIVATE_KEY ?? "",
  },
  {
    address: "0x8B151eBF6Ca9D3b5Bfdd1Eeb0b4F3e792B5061D9",
    privateKey: process.env.PRIVATE_KEY_2 ?? "",
  },
];

async function main() {
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

  // Deploy VoteToken contract
  console.log("Deploying VoteToken contract...");
  const voteTokenFactory = new VoteToken__factory(wallet);
  const voteTokenContract = await voteTokenFactory.deploy();
  await voteTokenContract.waitForDeployment();
  const voteTokenContractAddress = await voteTokenContract.getAddress();

  console.log(
    `VoteToken contract successfully deployed!\n
    \tContract address: ${voteTokenContractAddress}`
  );

  // Mint tokens and delegate voting power
  console.log(`\nMinting and delegating voting power...`);
  for (const wallet of WALLETS) {
    // Grant minter role to current wallet
    const MINTER_ROLE = await voteTokenContract.MINTER_ROLE();
    const roleTx = await voteTokenContract.grantRole(
      MINTER_ROLE,
      wallet.address
    );
    await roleTx.wait();

    const currWallet = new ethers.Wallet(wallet.privateKey, provider);
    await mintAndDelegate(voteTokenContract, currWallet);
  }

  // Get block number for TokenizedBallot
  const currBlockNumber = await provider.getBlockNumber();

  // Deploy TokenizedBallot contract
  console.log("\nDeploying TokenizedBallot contract...");
  const tokenizedBallotFactory = new TokenizedBallot__factory(wallet);
  const tokenizedBallotContract = await tokenizedBallotFactory.deploy(
    PROPOSALS.map((proposal) => ethers.encodeBytes32String(proposal)),
    voteTokenContractAddress,
    currBlockNumber
  );
  await tokenizedBallotContract.waitForDeployment();
  const tokenizedBallotContractAddress =
    await tokenizedBallotContract.getAddress();
  console.log(
    `TokenizedBallot contract successfully deployed!\n
    \tContract address: ${tokenizedBallotContractAddress}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
