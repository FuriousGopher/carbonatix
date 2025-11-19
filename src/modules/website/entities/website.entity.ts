import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PublisherEntity } from '../../publisher/entities/publisher.entity';

@Entity({ name: 'website' })
export class WebsiteEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'publisher_id', nullable: false })
  publisherId: number;

  @ManyToOne(() => PublisherEntity, (publisher) => publisher.websites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'publisher_id' })
  publisher: PublisherEntity;

  @Column()
  name: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
