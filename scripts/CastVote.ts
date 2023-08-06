import { ethers } from "ethers";
import { Ballot__factory } from "../typechain-types";
import * as dotenv from "dotenv";

dotenv.config();

function setupProvider() {
  //creating a JsonRpcProvider

  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}

async function getBallotContract() {
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_4 ?? "", provider);
  const ballotFactory = new Ballot__factory(wallet);
  const contractAddress = "0xE80BA9c894f34d79AC0C2bC17c467a416b06f37D";
  const ballotContract = ballotFactory.attach(contractAddress);
  return ballotContract;
}

async function castVote(ballotContract: any, proposalIndex: number) {
  try {
    const tx = await ballotContract.vote(proposalIndex);
    await tx.wait();
    console.log(`Vote cast for proposal ${proposalIndex}`);
  } catch (error) {
    console.error(`Failed to cast vote for proposal ${proposalIndex}:`, error);
  }
}

async function main() {
  const ballotContract = await getBallotContract();

  const voteChoice = process.argv[2];

  // Cast a vote for a proposal
  await castVote(ballotContract, Number(voteChoice)); //replace 0 with the index of proposal you want to vote
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
