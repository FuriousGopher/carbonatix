import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

class WebsiteSummaryDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;
}

export class PublisherResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({ name: 'contact_name' })
  @Expose()
  contactName: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ type: WebsiteSummaryDto, isArray: true, required: false })
  @Type(() => WebsiteSummaryDto)
  @Expose()
  websites?: WebsiteSummaryDto[];
}
