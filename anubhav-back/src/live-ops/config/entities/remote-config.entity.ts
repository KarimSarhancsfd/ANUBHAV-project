import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ConfigType {
  FLAG = 'flag',
  NUMBER = 'number',
  STRING = 'string',
  JSON = 'json',
}

@Entity('remote_configs')
export class RemoteConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'json' })
  value: any;

  @Column({
    type: 'enum',
    enum: ConfigType,
    default: ConfigType.JSON,
  })
  type: ConfigType;

  @Column({ default: 1 })
  version: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
