import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dontenv from "dotenv";

dontenv.config();

const CONTRACT_ADDRESS = "0x2509D43a6eFB95DFEA7339Ac4Fa17937416695A1";

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const proposalNum = Number(args[0]);

    if (isNaN(proposalNum) || proposalNum === 0) {
      throw new Error("Invalid arguments provided");
    }
    const proposalIndex = proposalNum - 1;
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

    const ballotFactory = new Ballot__factory(wallet);
    const ballotContract = ballotFactory.attach(CONTRACT_ADDRESS) as Ballot;

    const tx = await ballotContract.vote(proposalIndex);
    await tx.wait();
    const proposal = await ballotContract.proposals(proposalIndex);

    console.log(
      `Vote cast for proposal: ${ethers.decodeBytes32String(proposal.name)}`
    );
    console.log(`New vote count: ${proposal.voteCount}`);
  } catch (err) {
    console.error(`Failed to cast vote:`, (err as Error).message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
