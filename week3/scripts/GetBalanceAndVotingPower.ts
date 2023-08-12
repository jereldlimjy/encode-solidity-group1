import {
  TokenizedBallot,
  TokenizedBallot__factory,
  VoteToken,
  VoteToken__factory,
} from "../typechain-types";
import { ethers } from "ethers";
import setupProvider from "./utils/setupProvider";

const voteTokenContractAddress = "0x678AC7A39695fb0Df0F081a140A2731782FEb353";
const tokenizedBallotContractAddress =
  "0xAD38F55f1ebA80116a2FdF1B3e27caE4BA86202D";

async function main() {
  try {
    const args = process.argv.slice(2);
    const address = args[0] ?? "";

    if (!ethers.isAddress(address)) {
      throw new Error("Invalid address provided");
    }

    console.log("\nChecking balance and voting power...");
    const provider = setupProvider();
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY ?? "", provider);

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
