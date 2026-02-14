import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum LiveOpsAction {
  EVENT_TRIGGERED = 'event_triggered',
  CONFIG_UPDATED = 'config_updated',
  MANUAL_PUSH = 'manual_push',
}

export enum LiveOpsStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
}

@Entity('live_ops_logs')
export class LiveOpsLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LiveOpsAction,
  })
  action: LiveOpsAction;

  @Column({
    type: 'enum',
    enum: LiveOpsStatus,
  })
  status: LiveOpsStatus;

  @Column({ type: 'json', nullable: true })
  details: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn()
  @Index()
  timestamp: Date;
}
