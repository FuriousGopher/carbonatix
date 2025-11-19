import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { WebsiteEntity } from '../../website/entities/website.entity';

@Entity({ name: 'publisher' })
export class PublisherEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  email: string;

  @Column({ name: 'contact_name' })
  contactName: string;

  @OneToMany(() => WebsiteEntity, (website) => website.publisher, {
    cascade: ['insert', 'update'],
  })
  websites?: WebsiteEntity[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
