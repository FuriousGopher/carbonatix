import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisCacheService } from '../cache/redis-cache.service';
import { PublisherEntity } from './entities/publisher.entity';
import { PublisherService } from './publisher.service';

describe('PublisherService', () => {
  let service: PublisherService;
  let repository: jest.Mocked<Repository<PublisherEntity>>;
  let cache: jest.Mocked<RedisCacheService>;

  beforeEach(async () => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
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
        PublisherService,
        {
          provide: getRepositoryToken(PublisherEntity),
          useValue: repository,
        },
        {
          provide: RedisCacheService,
          useValue: cache,
        },
      ],
    }).compile();

    service = module.get(PublisherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return publishers list', async () => {
    repository.find.mockResolvedValue([
      {
        id: 1,
        name: 'A',
        email: 'a@mail.com',
        contactName: 'John',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as PublisherEntity,
    ]);

    const result = await service.findAll();

    expect(repository.find).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('A');
  });

  it('should throw when publisher not found', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.findOne(10)).rejects.toThrow(
      'Publisher with id 10 not found',
    );
  });

  it('should create new publisher when not existing', async () => {
    const dto = { name: 'Test', email: 't@test.com', contactName: 'Jane' };
    repository.findOne.mockResolvedValue(null);
    repository.create.mockReturnValue(dto as PublisherEntity);
    repository.save.mockResolvedValue({ id: 5, ...dto } as PublisherEntity);

    const response = await service.upsert(dto);

    expect(repository.create).toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalled();
    expect(response.id).toBe(5);
  });

  it('should delete publisher', async () => {
    repository.delete.mockResolvedValue({ affected: 1, raw: undefined });

    await service.remove(3);

    expect(repository.delete).toHaveBeenCalledWith(3);
    expect(cache.del).toHaveBeenCalledTimes(4);
  });
});
