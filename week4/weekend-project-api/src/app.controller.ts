import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
import { mintTokensDto } from './assets/dtos/mintTokens.dto';

dotenv.config();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/get-proposals')
  async getProposals(): Promise<any> {
    return await this.appService.getProposals();
  }

  @Get('/get-tokenized-ballot-address')
  getTokenizedBallotAddress(): { address: string } {
    return this.appService.getTokenizedBallotContractAddress();
  }

  @Get('/get-vote-token-contract-address')
  getVoteTokenContractAddress(): any {
    return this.appService.getVoteTokenContractAddress();
  }

  @Get('/get-vote-token-balance/:address')
  getTokenBalance(@Param('address') address: string) {
    return this.appService.getVoteTokenBalance(address);
  }

  @Post('mint-tokens')
  mintTokens(@Body() body: mintTokensDto): Promise<any> {
    console.log({ body });
    return this.appService.mintTokens(body.address);
  }
}
