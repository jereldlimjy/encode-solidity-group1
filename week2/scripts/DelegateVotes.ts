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
    const delegate = args[0];

    if (!ethers.isAddress(delegate)) {
      throw new Error("Invalid address provided");
    }
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

    const ballotFactory = new Ballot__factory(wallet);
    const ballotContract = ballotFactory.attach(CONTRACT_ADDRESS) as Ballot;

    console.log("Delegating vote...");
    const tx = await ballotContract.delegate(delegate);
    await tx.wait();
    console.log(`Delegated vote to address ${delegate}!`);
  } catch (err) {
    console.error(`Failed to cast vote:`, (err as Error).message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
