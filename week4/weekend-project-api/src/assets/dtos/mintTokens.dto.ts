import { ApiProperty } from '@nestjs/swagger';

export class mintTokensDto {
  @ApiProperty({ type: String, default: 'My Address', required: true })
  address: string;
}
