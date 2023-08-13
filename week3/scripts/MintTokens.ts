import { ethers } from "ethers";
import { VoteToken__factory } from "../typechain-types";
import setupProvider from "./utils/setupProvider";

const MINT_VALUE = ethers.parseUnits("5");
const VOTE_TOKEN_ADDRESS = "0xf4b552EFdE4a1813C3AF9a8129a6DB596E509A72";

async function main() {
  // Setting up test wallet with Minter Roles
  const provider = setupProvider();
  const test_wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY_4 ?? "",
    provider
  ); // Change to your own Private key object in ENV file

  // Connect to existing VoteToken contract via test wallet
  const voteTokenContract = VoteToken__factory.connect(
    VOTE_TOKEN_ADDRESS,
    test_wallet
  );
  console.log(
    `Connected to existing VoteToken contract at: ${VOTE_TOKEN_ADDRESS}`
  );

  // Mint tokens
  const mintTx = await voteTokenContract.mint(test_wallet.address, MINT_VALUE);
  await mintTx.wait();
  console.log(
    `\n\tMinted ${MINT_VALUE.toString()} decimal units to account ${
      test_wallet.address
    }`
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
