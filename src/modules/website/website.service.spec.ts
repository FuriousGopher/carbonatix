import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PublisherEntity } from '../publisher/entities/publisher.entity';
import { WebsiteEntity } from './entities/website.entity';
import { WebsiteService } from './website.service';

describe('WebsiteService', () => {
  let service: WebsiteService;
  let websiteRepository: jest.Mocked<Repository<WebsiteEntity>>;
  let publisherRepository: jest.Mocked<Repository<PublisherEntity>>;
  let cache: jest.Mocked<RedisCacheService>;

  beforeEach(async () => {
    websiteRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<Repository<WebsiteEntity>>;

    publisherRepository = {
      exists: jest.fn(),
    } as unknown as jest.Mocked<Repository<PublisherEntity>>;

    cache = {
      wrap: jest
        .fn()
        .mockImplementation((_key: string, factory: () => Promise<any>) =>
          factory(),
        ),
      del: jest.fn(),
    } as unknown as jest.Mocked<RedisCacheService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebsiteService,
        {
          provide: getRepositoryToken(WebsiteEntity),
          useValue: websiteRepository,
        },
        {
          provide: getRepositoryToken(PublisherEntity),
          useValue: publisherRepository,
        },
        {
          provide: RedisCacheService,
          useValue: cache,
        },
      ],
    }).compile();

    service = module.get(WebsiteService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should list websites', async () => {
    websiteRepository.find.mockResolvedValue([
      {
        id: 1,
        name: 'Site',
        publisherId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as WebsiteEntity,
    ]);

    const result = await service.findAll();

    expect(websiteRepository.find).toHaveBeenCalled();
    expect(result[0].name).toBe('Site');
  });

  it('should throw when website missing', async () => {
    websiteRepository.findOne.mockResolvedValue(null);
    await expect(service.findOne(5)).rejects.toThrow(
      'Website with id 5 not found',
    );
  });

  it('should upsert new website', async () => {
    publisherRepository.exists.mockResolvedValue(true as any);
    websiteRepository.findOne.mockResolvedValue(null);
    websiteRepository.create.mockReturnValue({
      name: 'Example',
      publisherId: 1,
    } as WebsiteEntity);
    websiteRepository.save.mockResolvedValue({
      id: 10,
      name: 'Example',
      publisherId: 1,
    } as WebsiteEntity);

    const dto = { name: 'Example', publisherId: 1 };
    const result = await service.upsert(dto);

    expect(publisherRepository.exists).toHaveBeenCalledWith({
      where: { id: dto.publisherId },
    });
    expect(websiteRepository.save).toHaveBeenCalled();
    expect(result.id).toBe(10);
  });

  it('should delete website if exists', async () => {
    websiteRepository.findOne.mockResolvedValue({
      id: 3,
      publisherId: 2,
    } as WebsiteEntity);
    websiteRepository.delete.mockResolvedValue({} as any);

    await service.remove(3);

    expect(websiteRepository.delete).toHaveBeenCalledWith(3);
    expect(cache.del).toHaveBeenCalled();
  });
});
