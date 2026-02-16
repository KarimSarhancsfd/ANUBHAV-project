import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum EventStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum EventType {
  DOUBLE_XP = 'double_xp',
  SPECIAL_SALE = 'special_sale',
  TOURNAMENT = 'tournament',
  MAINTENANCE = 'maintenance',
  ANNOUNCEMENT = 'announcement',
  XP_BOOST = 'xp_boost',
  GRANT_XP = 'grant_xp',
  MODIFY_STAT = 'modify_stat',
  UNLOCK_ACHIEVEMENT = 'unlock_achievement',
  CUSTOM = 'custom',
}

@Entity('live_events')
export class LiveEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.CUSTOM,
  })
  type: EventType;

  @Column({ type: 'json' })
  payload: Record<string, any>;

  @Column({
    type: 'enum',
    enum: EventStatus,
    default: EventStatus.SCHEDULED,
  })
  @Index()
  status: EventStatus;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  scheduledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  triggeredAt: Date | null;
}
