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
import { WebsiteService } from './website.service';
import { GetWebsitesQueryDto } from './dto/get-websites-query.dto';
import { WebsiteResponseDto } from './dto/website-response.dto';
import { UpsertWebsiteDto } from './dto/upsert-website.dto';

@ApiTags('website')
@Controller('website')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Get()
  @ApiOkResponse({ type: WebsiteResponseDto, isArray: true })
  findAll(@Query() query: GetWebsitesQueryDto): Promise<WebsiteResponseDto[]> {
    return this.websiteService.findAll(query.includePublisher);
  }

  @Get(':id')
  @ApiOkResponse({ type: WebsiteResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<WebsiteResponseDto> {
    return this.websiteService.findOne(id);
  }

  @Get('publisher/:publisherId')
  @ApiOkResponse({ type: WebsiteResponseDto, isArray: true })
  findByPublisher(
    @Param('publisherId', ParseIntPipe) publisherId: number,
  ): Promise<WebsiteResponseDto[]> {
    return this.websiteService.findByPublisher(publisherId);
  }

  @Post()
  @ApiOkResponse({ type: WebsiteResponseDto })
  upsert(@Body() dto: UpsertWebsiteDto): Promise<WebsiteResponseDto> {
    return this.websiteService.upsert(dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.websiteService.remove(id);
  }
}
