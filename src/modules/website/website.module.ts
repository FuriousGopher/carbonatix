import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisCacheModule } from '../cache/cache.module';
import { PublisherEntity } from '../publisher/entities/publisher.entity';
import { WebsiteController } from './website.controller';
import { WebsiteService } from './website.service';
import { WebsiteEntity } from './entities/website.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebsiteEntity, PublisherEntity]),
    RedisCacheModule,
  ],
  controllers: [WebsiteController],
  providers: [WebsiteService],
  exports: [WebsiteService],
})
export class WebsiteModule {}
