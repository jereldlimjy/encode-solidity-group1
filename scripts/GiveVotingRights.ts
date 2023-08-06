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
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);
  const ballotFactory = new Ballot__factory(wallet);
  const contractAddress = "0xE80BA9c894f34d79AC0C2bC17c467a416b06f37D";
  const ballotContract = ballotFactory.attach(contractAddress);
  return ballotContract;
}

//function to give voting rights
async function giveVotingRights(ballotContract: any, voter: string) {
  try {
    const tx = await ballotContract.giveRightToVote(voter);
    await tx.wait();
    console.log(`Voting rights given to ${voter}`);
  } catch (error) {
    console.error(`Failed to give voting rights to ${voter}:`, error);
  }
}

async function main() {
  const ballotContract = await getBallotContract();

  //taking target address from argument
  const targetAddress = process.argv[2];

  //Calling giveVotingRights function
  await giveVotingRights(
    ballotContract,
    targetAddress // target address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
