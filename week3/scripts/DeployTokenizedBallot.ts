import { ethers } from "ethers";
import {
  VoteToken__factory,
  TokenizedBallot__factory,
} from "../typechain-types";
import * as dotenv from "dotenv";
import mintAndDelegate from "./utils/mintAndDelegate";
import setupProvider from "./utils/setupProvider";

dotenv.config();

const PROPOSALS = ["One Piece", "Naruto", "Bleach", "One-Punch Man"];
const WALLETS = [
  {
    address: "0x7B7E25c974B7Ca1a8805a2C31C51405FE256982B",
    privateKey: process.env.PRIVATE_KEY_1 ?? "",
  },
  {
    address: "0x46Baa3E0dd51eA3c154ba2ffEe570EfDbEbAFe10",
    privateKey: process.env.PRIVATE_KEY_2 ?? "",
  },
];

async function main() {
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_1 ?? "", provider);

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
