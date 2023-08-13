import {
  TokenizedBallot,
  TokenizedBallot__factory,
  VoteToken,
  VoteToken__factory,
} from "../typechain-types";
import { ethers } from "ethers";
import setupProvider from "./utils/setupProvider";

const voteTokenContractAddress = "0xf4b552EFdE4a1813C3AF9a8129a6DB596E509A72";
const tokenizedBallotContractAddress =
  "0x4A185F68F11DDac1C4209421e65560c47fe3b637";

async function main() {
  try {
    const args = process.argv.slice(2);
    const address = args[0] ?? "";

    if (!ethers.isAddress(address)) {
      throw new Error("Invalid address provided");
    }

    console.log("\nChecking balance and voting power...");
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_1 ?? "", provider);

    const voteTokenFactory = new VoteToken__factory(wallet);
    const voteTokenContract = voteTokenFactory.attach(
      voteTokenContractAddress
    ) as VoteToken;
    const balance = await voteTokenContract.balanceOf(address);
    console.log(
      `\n\tBalance: Account ${address} has ${balance.toString()} decimal units of VTK`
    );

    const tokenizedBallotFactory = new TokenizedBallot__factory(wallet);
    const tokenizedBallotContract = tokenizedBallotFactory.attach(
      tokenizedBallotContractAddress
    ) as TokenizedBallot;
    const votePower = await tokenizedBallotContract.votingPower(address);
    console.log(
      `\tVoting Power: Account ${address} has ${votePower.toString()} units of voting power`
    );
  } catch (err) {
    console.error((err as Error).message);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
