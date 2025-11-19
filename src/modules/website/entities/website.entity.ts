import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PublisherEntity } from '../../publisher/entities/publisher.entity';

@Entity({ name: 'website' })
export class WebsiteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'publisher_id' })
  publisherId: number;

  @ManyToOne(() => PublisherEntity, (publisher) => publisher.websites, {
    onDelete: 'CASCADE',
  })
  publisher: PublisherEntity;

  @Column()
  name: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
