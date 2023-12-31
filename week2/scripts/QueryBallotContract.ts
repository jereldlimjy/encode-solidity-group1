import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dontenv from "dotenv";

dontenv.config();

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const contractAddress = args[0] ?? "";

    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

    const ballotFactory = new Ballot__factory(wallet);
    const ballotContract = ballotFactory.attach(contractAddress) as Ballot;

    // get proposal names
    let index = 0;
    console.log("Querying proposals:");
    while (true) {
      try {
        const proposal = await ballotContract.proposals(index);
        console.log(`Proposal ${index + 1}:`);
        console.log(`\tName: ${ethers.decodeBytes32String(proposal.name)}`);
        console.log(`\tVote count: ${proposal.voteCount}`);
        index++;
      } catch (err) {
        console.log("End of proposals query!");
        break;
      }
    }

    // get winning proposal
    console.log("\nQuerying winning proposal:");
    const winningProposalIndex = await ballotContract.winningProposal();
    const winningProposal = await ballotContract.proposals(
      winningProposalIndex
    );
    console.log(`\tName: ${ethers.decodeBytes32String(winningProposal.name)}`);
    console.log(`\tVote count: ${winningProposal.voteCount}`);
    console.log("End of winning proposal query!");
  } catch (err) {
    console.error("Error querying contract:", (err as Error).message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
