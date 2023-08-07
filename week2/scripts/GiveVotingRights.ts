import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dontenv from "dotenv";

dontenv.config();

const CONTRACT_ADDRESS = "0x2509D43a6eFB95DFEA7339Ac4Fa17937416695A1";
const voters = [
  "0x96F3A28836454108f542D8Be888625375032aBD5",
  "0x8B151eBF6Ca9D3b5Bfdd1Eeb0b4F3e792B5061D9",
  "0xE8bA93f3Caa61CE2cd0D3d52A22365f96A97e26D",
];

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}

async function main() {
  const provider = setupProvider();
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

  const ballotFactory = new Ballot__factory(wallet);
  const ballotContract = ballotFactory.attach(CONTRACT_ADDRESS) as Ballot;

  // give right to vote
  console.log("Giving voting rights...");
  for (let voter of voters) {
    try {
      await ballotContract.giveRightToVote(voter);
      console.log(`Address ${voter} has been given the right to vote!`);
    } catch (err) {
      console.log(`Function call failed for address ${voter}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
