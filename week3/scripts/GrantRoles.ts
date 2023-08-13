import { ethers } from "ethers";
import { VoteToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";
import setupProvider from "./utils/setupProvider";

dotenv.config();

const VOTE_TOKEN_ADDRESS = "0x11B17E242d97A122eA8355b870eBAD04E5376ecD";
const MINTER_ADDRESS = "0x12EF0c418644ABDAF92974C2601896fB2725383e";

async function main() {
  const provider = setupProvider();
  const walletDeployer = new ethers.Wallet(
    process.env.PRIVATE_KEY_1 ?? "",
    provider
  );

  // Connect to existing VoteToken contract
  const voteTokenContract = VoteToken__factory.connect(
    VOTE_TOKEN_ADDRESS,
    walletDeployer
  );
  console.log(
    `Connected to existing VoteToken contract at: ${VOTE_TOKEN_ADDRESS}`
  );

  // Grant minter role to MINTER_ADDRESS
  console.log(`\nGranting minter role to: ${MINTER_ADDRESS}`);
  const MINTER_ROLE = await voteTokenContract.MINTER_ROLE();
  const roleTx = await voteTokenContract.grantRole(MINTER_ROLE, MINTER_ADDRESS);
  await roleTx.wait();
  console.log(`\nMinter role granted to: ${MINTER_ADDRESS}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
