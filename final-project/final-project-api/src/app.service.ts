import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import * as etherboardJson from './assets/EtherBoardV2.json';

const ETHERBOARD_CONTRACT_ADDRESS =
  '0xa1181e7eeA73969d87E53A144C9d519453f8921C';

@Injectable()
export class AppService {
  etherboardContract: ethers.Contract;
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
    this.etherboardContract = new ethers.Contract(
      ETHERBOARD_CONTRACT_ADDRESS,
      etherboardJson.abi,
      this.wallet,
    );
  }

  async getNFTs(): Promise<any> {
    try {
      const totalSupply = await this.etherboardContract.totalSupply();
      const totalSupplyNum = parseInt(totalSupply.toString());
      const nfts = [];

      for (let i = 0; i < totalSupplyNum; i++) {
        const message = await this.etherboardContract.getMessageByTokenId(i);
        nfts.push({
          id: i.toString(),
          message,
        });
      }

      return nfts;
    } catch (err) {
      return [];
    }
  }

  async getNFTsByOwner(ownerAddress: string): Promise<any[]> {
    try {
      const nftCount = await this.etherboardContract.balanceOf(ownerAddress);
      const nftCountNum = parseInt(nftCount.toString());
      const nfts = [];

      for (let i = 0; i < nftCountNum; i++) {
        const tokenId = await this.etherboardContract.tokenOfOwnerByIndex(
          ownerAddress,
          i,
        );
        const message =
          await this.etherboardContract.getMessageByTokenId(tokenId);

        nfts.push({
          id: tokenId.toString(),
          message,
        });
      }

      return nfts;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}
