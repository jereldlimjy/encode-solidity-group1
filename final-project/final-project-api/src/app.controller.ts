import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/get-nfts')
  getNFTs(): Promise<any> {
    return this.appService.getNFTs();
  }

  @Get('/get-nfts-by-owner')
  async getNFTsByOwner(@Query('address') ownerAddress: string): Promise<any[]> {
    if (!ownerAddress) {
      throw new Error('Missing address query parameter');
    }
    return await this.appService.getNFTsByOwner(ownerAddress);
  }
}
