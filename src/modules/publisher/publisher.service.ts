import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisCacheService } from '../cache/redis-cache.service';
import { UpsertPublisherDto } from './dto/upsert-publisher.dto';
import { PublisherResponseDto } from './dto/publisher-response.dto';
import { PublisherEntity } from './entities/publisher.entity';
import {
  getPublisherDetailCacheKey,
  getPublisherInvalidationKeys,
  getPublisherListCacheKey,
} from './publisher-cache.util';

@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name);

  constructor(
    @InjectRepository(PublisherEntity)
    private readonly publisherRepository: Repository<PublisherEntity>,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  private mapToResponse(payload: PublisherEntity): PublisherResponseDto {
    return plainToInstance(PublisherResponseDto, payload, {
      excludeExtraneousValues: true,
    });
  }

  private mapCollection(payload: PublisherEntity[]): PublisherResponseDto[] {
    return plainToInstance(PublisherResponseDto, payload, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(includeWebsites = false): Promise<PublisherResponseDto[]> {
    try {
      const cacheKey = getPublisherListCacheKey(includeWebsites);

      const publishers = await this.redisCacheService.wrap(cacheKey, () =>
        this.publisherRepository.find({
          relations: includeWebsites ? ['websites'] : [],
          order: { name: 'ASC' },
        }),
      );

      return this.mapCollection(publishers);
    } catch (error) {
      this.logger.error('Failed to fetch publishers', error.stack);
      throw error;
    }
  }

  async findOne(
    id: number,
    includeWebsites = true,
  ): Promise<PublisherResponseDto> {
    try {
      const cacheKey = getPublisherDetailCacheKey(id, includeWebsites);

      const publisher = await this.redisCacheService.wrap(
        cacheKey,
        async () => {
          const entity = await this.publisherRepository.findOne({
            where: { id },
            relations: includeWebsites ? ['websites'] : [],
          });
          if (!entity) {
            throw new NotFoundException(`Publisher with id ${id} not found`);
          }
          return entity;
        },
      );

      return this.mapToResponse(publisher);
    } catch (error) {
      this.logger.error(
        `Failed to fetch publisher id=${id}`,
        error.stack,
      );
      throw error;
    }
  }

  async upsert(dto: UpsertPublisherDto): Promise<PublisherResponseDto> {
    try {
      const where = dto.id ? { id: dto.id } : { name: dto.name };
      const existing = await this.publisherRepository.findOne({ where });

      const entity = existing
        ? Object.assign(existing, {
            name: dto.name,
            email: dto.email,
            contactName: dto.contactName,
          })
        : this.publisherRepository.create({
            name: dto.name,
            email: dto.email,
            contactName: dto.contactName,
          });

      const saved = await this.publisherRepository.save(entity);
      await this.invalidateCache(saved.id);
      return this.mapToResponse(saved);
    } catch (error) {
      this.logger.error(
        `Failed to upsert publisher name=${dto.name}`,
        error.stack,
      );
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.publisherRepository.delete(id);

      if (!result.affected) {
        throw new NotFoundException(`Publisher with id ${id} not found`);
      }

      await this.invalidateCache(id);
    } catch (error) {
      this.logger.error(`Failed to delete publisher id=${id}`, error.stack);
      throw error;
    }
  }

  private async invalidateCache(id: number): Promise<void> {
    const keys = getPublisherInvalidationKeys(id);
    await Promise.all(keys.map((key) => this.redisCacheService.del(key)));
  }
}
