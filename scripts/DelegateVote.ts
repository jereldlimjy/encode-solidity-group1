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
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_2 ?? "", provider);
  const ballotFactory = new Ballot__factory(wallet);
  const contractAddress = "0xE80BA9c894f34d79AC0C2bC17c467a416b06f37D";
  const ballotContract = ballotFactory.attach(contractAddress);
  return ballotContract;
}

async function delegateVotes(ballotContract: any, newAddress: string) {
  try {
    const tx = await ballotContract.delegate(newAddress);
    await tx.wait();
    console.log(`Voting rights given to ${newAddress}`);
  } catch (error) {
    console.log(`Failed to delegate votes to ${newAddress} `, error);
  }
}

async function main() {
  const ballotContract = await getBallotContract();

  //taking target address from argument
  const delegateAddress = process.argv[2];

  // Delegate votes to another address
  await delegateVotes(ballotContract, delegateAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
