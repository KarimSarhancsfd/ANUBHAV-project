import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('player_progress')
export class PlayerProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index({ unique: true })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'bigint', default: 0 })
  xp: number;

  @Column({ type: 'json', nullable: true })
  stats: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  skills: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  achievements: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
