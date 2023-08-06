import { ethers } from "ethers";
import { Ballot, Ballot__factory } from "../typechain-types";
import * as dontenv from "dotenv";

dontenv.config();

const CONTRACT_ADDRESS = "0x1368B693903684711A29D88bf768bBbd430baCA1";

function setupProvider() {
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_ENDPOINT_URL ?? ""
  );
  return provider;
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const proposalIndex = Number(args[0]);

    if (isNaN(proposalIndex)) {
      throw new Error("Invalid arguments provided");
    }
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

    const ballotFactory = new Ballot__factory(wallet);
    const ballotContract = ballotFactory.attach(CONTRACT_ADDRESS) as Ballot;

    const tx = await ballotContract.vote(proposalIndex);
    await tx.wait();
    console.log(`Vote cast for proposal ${proposalIndex}`);
  } catch (err) {
    console.error(`Failed to cast vote:`, (err as Error).message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
