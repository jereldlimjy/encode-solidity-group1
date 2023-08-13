import { ethers } from "ethers";
import { TokenizedBallot__factory } from "../typechain-types";
import setupProvider from "./utils/setupProvider";

const PROPOSALS = ["One Piece", "Naruto", "Bleach", "One-Punch Man"];
const voteTokenContractAddress = "0xf4b552EFdE4a1813C3AF9a8129a6DB596E509A72";

async function main() {
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_1 ?? "", provider);

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
