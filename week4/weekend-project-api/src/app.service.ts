import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as voteTokenJson from './assets/VoteToken.json';
import * as tokenizedBallotJson from './assets/TokenizedBallot.json';

const VOTE_TOKEN_CONTRACT_ADDRESS =
  '0xf4b552EFdE4a1813C3AF9a8129a6DB596E509A72';
const TOKENIZED_BALLOT_CONTRACT_ADDRESS =
  '0x47E0EBB620309C7c6f0202e22e49C428F04510f1';

@Injectable()
export class AppService {
  voteTokenContract: ethers.Contract;
  tokenizedBallotContract: ethers.Contract;
  provider: ethers.Provider;
  wallet: ethers.Wallet;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(
      process.env.RPC_ENDPOINT_URL ?? '',
    );
    this.wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY ?? '',
      this.provider,
    );
    this.voteTokenContract = new ethers.Contract(
      VOTE_TOKEN_CONTRACT_ADDRESS,
      voteTokenJson.abi,
      this.wallet,
    );
    this.tokenizedBallotContract = new ethers.Contract(
      TOKENIZED_BALLOT_CONTRACT_ADDRESS,
      tokenizedBallotJson.abi,
      this.wallet,
    );
  }

  getVoteTokenContractAddress(): any {
    return { address: VOTE_TOKEN_CONTRACT_ADDRESS };
  }

  getTokenizedBallotContractAddress(): { address: string } {
    return { address: TOKENIZED_BALLOT_CONTRACT_ADDRESS };
  }

  async getProposals(): Promise<any> {
    const proposals = [];

    let index = 0;

    while (true) {
      try {
        const proposal = await this.tokenizedBallotContract.proposals(index);
        proposals.push({
          name: ethers.decodeBytes32String(proposal.name),
          voteCount: proposal.voteCount.toString(),
        });
        index++;
      } catch (err) {
        break;
      }
    }

    return { result: proposals };
  }

  getVoteTokenBalance(address: string) {
    return this.voteTokenContract.balanceOf(address);
  }

  async mintTokens(address: string): Promise<any> {
    console.log('Minting tx to ' + address);
    const tx = await this.voteTokenContract.mint(
      address,
      ethers.parseUnits('1'),
    );
    const receipt = await tx.wait();
    console.log({ receipt });
    return { success: true, txHash: receipt.hash };
  }
}
