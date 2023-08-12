import { ethers, keccak256 } from "ethers";
import { VoteToken } from "../../typechain-types";

const MINT_VALUE = ethers.parseUnits("1");

export default async function mintAndDelegate(
  contract: VoteToken,
  wallet: ethers.Wallet
) {
  try {
    // Mint tokens
    const mintTx = await contract.mint(wallet.address, MINT_VALUE);
    await mintTx.wait();
    console.log(
      `\n\tMinted ${MINT_VALUE.toString()} decimal units to account ${
        wallet.address
      }`
    );

    // Self delegate
    const delegateTx = await contract.connect(wallet).delegate(wallet.address);
    await delegateTx.wait();
    const votes = await contract.getVotes(wallet.address);
    console.log(
      `\tAccount ${
        wallet.address
      } has ${votes.toString()} units of voting power after self delegating`
    );
  } catch (err) {
    console.error((err as Error).message);
  }
}
