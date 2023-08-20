import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as voteTokenJson from './assets/VoteToken.json';
import * as tokenizedBallotJson from './assets/TokenizedBallot.json';

const VOTE_TOKEN_CONTRACT_ADDRESS =
  '0xf4b552EFdE4a1813C3AF9a8129a6DB596E509A72';
const TOKENIZED_BALLOT_CONTRACT_ADDRESS =
  '0x706A384853570AF0a5624C4AA157750570288D1C';

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

  getHello(): string {
    return 'Hello World!';
  }

  getVoteTokenContractAddress(): string {
    return VOTE_TOKEN_CONTRACT_ADDRESS;
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
}
