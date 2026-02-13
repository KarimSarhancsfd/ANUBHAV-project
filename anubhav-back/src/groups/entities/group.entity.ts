import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  // @OneToMany(() => USER_GROUPS, (user_groups) => user_groups.group);
  // @JoinColumn({name: 'user_groups'})
  // user_groups!: USER_GROUPS;

  // @OneToMany (() => USER_GROUP_CHAT, (user_group_chat) => user_group_chat.group);
  // @JoinColumn({name: 'user_group_chat'})
  // user_group_chat!: USER_GROUP_CHAT;

  @Column({ type: 'varchar', length: 30, unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  image_url: string;

  @Column({ type: 'varchar', nullable: true })
  background_color: string;

  @Column({ type: 'varchar', nullable: true })
  background_cover_url: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
