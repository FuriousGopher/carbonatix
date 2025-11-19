import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PublisherService } from './publisher.service';
import { GetPublishersQueryDto } from './dto/get-publishers-query.dto';
import { UpsertPublisherDto } from './dto/upsert-publisher.dto';
import { PublisherResponseDto } from './dto/publisher-response.dto';

@ApiTags('publisher')
@Controller('publisher')
export class PublisherController {
  constructor(private readonly publisherService: PublisherService) {}

  @Get()
  @ApiOkResponse({ type: PublisherResponseDto, isArray: true })
  findAll(
    @Query() query: GetPublishersQueryDto,
  ): Promise<PublisherResponseDto[]> {
    return this.publisherService.findAll(query.includeWebsites);
  }

  @Get(':id')
  @ApiOkResponse({ type: PublisherResponseDto })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PublisherResponseDto> {
    return this.publisherService.findOne(id);
  }

  @Post()
  @ApiOkResponse({ type: PublisherResponseDto })
  upsert(@Body() dto: UpsertPublisherDto): Promise<PublisherResponseDto> {
    return this.publisherService.upsert(dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.publisherService.remove(id);
  }
}
