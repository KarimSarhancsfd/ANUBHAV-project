import { Group } from 'src/groups/entities/group.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'receiver_id' })
  receiver_id: User;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'sender_id' })
  sender_id: User;

  @ManyToOne(() => Group, { eager: false })
  @JoinColumn({ name: 'group_id' })
  group_id: Group;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  @Column()
  title: string;

  @Column()
  type: string;

  @Column()
  body: string;

  @Column({ nullable: true })
  data: string;

  @Column({ default: false })
  seen: boolean;

  @Column({ default: false })
  accept_request: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
