import { TokenizedBallot, TokenizedBallot__factory } from "../typechain-types";
import { ethers } from "ethers";
import setupProvider from "./utils/setupProvider";

const tokenizedBallotContractAddress =
  "0x4A185F68F11DDac1C4209421e65560c47fe3b637";

async function main() {
  try {
    const args = process.argv.slice(2);
    const proposalIndex = Number(args[0]);
    const amount = ethers.parseUnits(args[1]); // throws error if cannot parse

    if (isNaN(proposalIndex) || proposalIndex < 0) {
      throw new Error("Invalid arguments provided");
    }

    console.log("Casting votes...");
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_4 ?? "", provider);

    const tokenizedBallotFactory = new TokenizedBallot__factory(wallet);
    const tokenizedBallotContract = tokenizedBallotFactory.attach(
      tokenizedBallotContractAddress
    ) as TokenizedBallot;

    const voteTx = await tokenizedBallotContract.vote(proposalIndex, amount);
    await voteTx.wait();
    const proposal = await tokenizedBallotContract.proposals(proposalIndex);

    console.log(
      `\n\tVote cast for proposal: ${ethers.decodeBytes32String(proposal.name)}`
    );
    console.log(`\tNew vote count: ${proposal.voteCount} units`);
  } catch (err) {
    console.error((err as Error).message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
