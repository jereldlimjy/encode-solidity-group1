import { ethers } from "ethers";
import { VoteToken__factory } from "../typechain-types";
import setupProvider from "./utils/setupProvider";

const VOTE_TOKEN_ADDRESS = "0xf4b552EFdE4a1813C3AF9a8129a6DB596E509A72";
const DELEGATEE_ADDRESS = "0x7B7E25c974B7Ca1a8805a2C31C51405FE256982B";

async function main() {
  // Setting up test wallet with Minter Roles
  const provider = setupProvider();
  const delegator_wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_4 ?? "",
    provider
  ); // Change to your own Private key object in ENV file

  // Connect to existing VoteToken contract via test wallet
  const voteTokenContract = VoteToken__factory.connect(
    VOTE_TOKEN_ADDRESS,
    delegator_wallet
  );
  console.log(
    `Connected to existing VoteToken contract at: ${VOTE_TOKEN_ADDRESS}`
  );

  // Delegate Votes
  const delegateTx = await voteTokenContract
    .connect(delegator_wallet)
    .delegate(DELEGATEE_ADDRESS);
  await delegateTx.wait();

  const balance = await voteTokenContract.balanceOf(delegator_wallet);

  console.log(
    `\nDelegated ${balance.toString()} decimal units to account ${DELEGATEE_ADDRESS}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
