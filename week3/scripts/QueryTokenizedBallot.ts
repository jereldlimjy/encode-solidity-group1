import { ethers } from "ethers";
import { TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
import * as dotenv from "dotenv";
import setupProvider from "./utils/setupProvider";

async function main() {
  try {
    const args = process.argv.slice(2);
    const contractAddress = args[0] ?? "";

    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

    const tokenizedBallotFactory = new TokenizedBallot__factory(wallet);
    const tokenizedBallotContract = tokenizedBallotFactory.attach(
      contractAddress
    ) as TokenizedBallot;

    // get proposal names
    let index = 0;
    console.log("Querying proposals...");
    while (true) {
      try {
        const proposal = await tokenizedBallotContract.proposals(index);
        console.log(`\nProposal ${index + 1}:`);
        console.log(`\tName: ${ethers.decodeBytes32String(proposal.name)}`);
        console.log(`\tVote count: ${proposal.voteCount} units`);
        index++;
      } catch (err) {
        console.log("End of proposals query!");
        break;
      }
    }

    // get winning proposal
    console.log("\nQuerying winning proposal...");
    const winningProposalIndex =
      await tokenizedBallotContract.winningProposal();
    const winningProposal = await tokenizedBallotContract.proposals(
      winningProposalIndex
    );
    console.log(
      `\n\tName: ${ethers.decodeBytes32String(winningProposal.name)}`
    );
    console.log(`\tVote count: ${winningProposal.voteCount} units`);
    console.log("End of winning proposal query!");
  } catch (err) {
    console.error("Error querying contract:", (err as Error).message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
