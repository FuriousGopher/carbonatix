import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PublisherEntity } from '../publisher/entities/publisher.entity';
import { getPublisherInvalidationKeys } from '../publisher/publisher-cache.util';
import { UpsertWebsiteDto } from './dto/upsert-website.dto';
import { WebsiteResponseDto } from './dto/website-response.dto';
import { WebsiteEntity } from './entities/website.entity';

const WEBSITE_CACHE_PREFIX = 'website';

const getWebsiteListCacheKey = (includePublisher: boolean) =>
  `${WEBSITE_CACHE_PREFIX}:all:${
    includePublisher ? 'with-publisher' : 'basic'
  }`;

const getWebsiteDetailCacheKey = (id: number, includePublisher: boolean) =>
  `${WEBSITE_CACHE_PREFIX}:id:${id}:${
    includePublisher ? 'with-publisher' : 'basic'
  }`;

const getWebsitesByPublisherCacheKey = (
  publisherId: number,
  includePublisher: boolean,
) =>
  `${WEBSITE_CACHE_PREFIX}:publisher:${publisherId}:${
    includePublisher ? 'with-publisher' : 'basic'
  }`;

@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name);
  constructor(
    @InjectRepository(WebsiteEntity)
    private readonly websiteRepository: Repository<WebsiteEntity>,
    @InjectRepository(PublisherEntity)
    private readonly publisherRepository: Repository<PublisherEntity>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  private mapOne(payload: WebsiteEntity): WebsiteResponseDto {
    return plainToInstance(WebsiteResponseDto, payload, {
      excludeExtraneousValues: true,
    });
  }

  private mapMany(payload: WebsiteEntity[]): WebsiteResponseDto[] {
    return plainToInstance(WebsiteResponseDto, payload, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(includePublisher = false): Promise<WebsiteResponseDto[]> {
    try {
      const cacheKey = getWebsiteListCacheKey(includePublisher);
      const websites = await this.redisCacheService.wrap(cacheKey, () =>
        this.websiteRepository.find({
          relations: includePublisher ? ['publisher'] : [],
          order: { name: 'ASC' },
        }),
      );
      return this.mapMany(websites);
    } catch (error) {
      this.logger.error('Failed to fetch websites', error.stack);
      throw error;
    }
  }

  async findOne(
    id: number,
    includePublisher = true,
  ): Promise<WebsiteResponseDto> {
    try {
      const cacheKey = getWebsiteDetailCacheKey(id, includePublisher);
      const website = await this.redisCacheService.wrap(cacheKey, async () => {
        const entity = await this.websiteRepository.findOne({
          where: { id },
          relations: includePublisher ? ['publisher'] : [],
        });
        if (!entity) {
          throw new NotFoundException(`Website with id ${id} not found`);
        }
        return entity;
      });
      return this.mapOne(website);
    } catch (error) {
      this.logger.error(`Failed to fetch website id=${id}`, error.stack);
      throw error;
    }
  }

  async findByPublisher(
    publisherId: number,
    includePublisher = false,
  ): Promise<WebsiteResponseDto[]> {
    try {
      const cacheKey = getWebsitesByPublisherCacheKey(
        publisherId,
        includePublisher,
      );
      const websites = await this.redisCacheService.wrap(cacheKey, () =>
        this.websiteRepository.find({
          where: { publisherId },
          relations: includePublisher ? ['publisher'] : [],
          order: { name: 'ASC' },
        }),
      );
      return this.mapMany(websites);
    } catch (error) {
      this.logger.error(
        `Failed to fetch websites by publisher ${publisherId}`,
        error.stack,
      );
      throw error;
    }
  }

  async upsert(dto: UpsertWebsiteDto): Promise<WebsiteResponseDto> {
    try {
      await this.ensurePublisherExists(dto.publisherId);

      const where = dto.id
        ? { id: dto.id }
        : { name: dto.name, publisherId: dto.publisherId };

      const existing = await this.websiteRepository.findOne({
        where,
        relations: ['publisher'],
      });

      const entity = existing
        ? Object.assign(existing, {
            name: dto.name,
            publisherId: dto.publisherId,
          })
        : this.websiteRepository.create({
            name: dto.name,
            publisherId: dto.publisherId,
          });

      const previousPublisherId = existing?.publisherId;

      const saved = await this.websiteRepository.save(entity);

      const affectedPublisherIds = [
        saved.publisherId,
        previousPublisherId,
      ].filter((id): id is number => typeof id === 'number');

      await this.invalidateCache(saved.id, affectedPublisherIds);
      return this.mapOne(saved);
    } catch (error) {
      this.logger.error(
        `Failed to upsert website name=${dto.name}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const existing = await this.websiteRepository.findOne({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Website with id ${id} not found`);
      }

      await this.websiteRepository.delete(id);
      await this.invalidateCache(id, [existing.publisherId]);
    } catch (error) {
      this.logger.error(`Failed to delete website id=${id}`, error.stack);
      throw error;
    }
  }

  private async ensurePublisherExists(publisherId: number): Promise<void> {
    try {
      const exists = await this.publisherRepository.exists({
        where: { id: publisherId },
      });
      if (!exists) {
        throw new NotFoundException(
          `Publisher with id ${publisherId} does not exist`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to validate publisher id=${publisherId}`,
        error.stack,
      );
      throw error;
    }
  }

  private async invalidateCache(
    websiteId: number,
    publisherIds: number[],
  ): Promise<void> {
    const uniquePublisherIds = Array.from(new Set(publisherIds));

    const keys = [
      getWebsiteListCacheKey(false),
      getWebsiteListCacheKey(true),
      getWebsiteDetailCacheKey(websiteId, false),
      getWebsiteDetailCacheKey(websiteId, true),
      ...uniquePublisherIds.flatMap((id) => [
        getWebsitesByPublisherCacheKey(id, false),
        getWebsitesByPublisherCacheKey(id, true),
        ...getPublisherInvalidationKeys(id),
      ]),
    ];

    await Promise.all(keys.map((key) => this.redisCacheService.del(key)));
  }
}
