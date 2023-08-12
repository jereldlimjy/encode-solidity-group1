import { VoteToken } from "../../typechain-types";

export default async function getBalanceAndVotingPower(
  contract: VoteToken,
  address: string
) {
  try {
    const balance = await contract.balanceOf(address);
    console.log(
      `\n\tBalance: Account ${address} has ${balance.toString()} decimal units of VTK`
    );

    const votePower = await contract.getVotes(address);
    console.log(
      `\tVoting Power: Account ${address} has ${votePower.toString()} units of voting power`
    );
  } catch (err) {
    console.error((err as Error).message);
  }
}
