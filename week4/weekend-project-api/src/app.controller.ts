import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/get-proposals')
  async getProposals(): Promise<any> {
    return await this.appService.getProposals();
  }

  @Get('/get-tokenized-ballot-address')
  getTokenizedBallotAddress(): { address: string } {
    return this.appService.getTokenizedBallotContractAddress();
  }
}
