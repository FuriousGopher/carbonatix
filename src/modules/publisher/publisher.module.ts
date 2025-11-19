import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublisherController } from './publisher.controller';
import { PublisherService } from './publisher.service';
import { PublisherEntity } from './entities/publisher.entity';
import { WebsiteEntity } from '../website/entities/website.entity';
import { RedisCacheModule } from '../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PublisherEntity, WebsiteEntity]),
    RedisCacheModule,
  ],
  controllers: [PublisherController],
  providers: [PublisherService],
  exports: [PublisherService],
})
export class PublisherModule {}
