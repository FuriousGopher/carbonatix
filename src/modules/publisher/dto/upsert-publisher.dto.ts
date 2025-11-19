import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertPublisherDto {
  @ApiProperty({
    description: 'Publisher unique name',
    example: 'Acme Media Group',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Business contact email',
    example: 'contact@acmemedia.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Publisher contact person full name',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty()
  contactName: string;

  @ApiProperty({
    description: 'Optional identifier for explicit updates',
    example: 3,
    required: false,
  })
  @IsOptional()
  id?: number;
}
