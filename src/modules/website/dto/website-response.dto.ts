import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class PublisherSummaryDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;
}

export class WebsiteResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  publisherId: number;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: PublisherSummaryDto, required: false })
  @Type(() => PublisherSummaryDto)
  @Expose()
  publisher?: PublisherSummaryDto;
}
