import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class UpsertWebsiteDto {
  @ApiProperty({
    description: 'Website readable name',
    example: 'carbonatix.com',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Publisher identifier', example: 1 })
  @IsPositive()
  @IsInt()
  publisherId: number;

  @ApiProperty({
    required: false,
    description: 'Website identifier for updates',
    example: 5,
  })
  @IsOptional()
  @IsPositive()
  @IsInt()
  id?: number;
}
