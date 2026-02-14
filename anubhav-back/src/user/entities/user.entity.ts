import { Quiz } from 'src/quiz/entities/quiz.entity';
import { Notification } from 'src/notification/entities/notification.entity';
import { UserGroupChat } from 'src/user_group_chat/entities/user_group_chat.entity';
import { UserActivities } from 'src/useractivities/entities/useractivities.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  OneToMany,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Country } from 'src/country/entities/country.entity';
import { Category } from 'src/category/entities/category.entity';
import { QuizResult } from '../../quiz/entities/quiz-result.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Country, (country) => country.id)
  @JoinColumn({ name: 'country_id' })
  country_id!: Country;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  phone_number!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  user_name!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  google_id!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  facebook_id!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  apple_id!: string;

  @Column({ nullable: true })
  token: string;

  @Column({ type: 'int', nullable: true, default: '0' })
  birth_date!: number;

  @Column({ type: 'char', nullable: true, default: '0' })
  gender!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  image_url!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  verify_email!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  verify_code!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  password_changeAt!: string;

  @Column({ type: 'int', nullable: true, default: '0' })
  password_reset_code!: number;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  password_reset_expires!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  password_reset_verified!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  books_goal!: string;

  @Column({ type: 'int', nullable: true, default: '0' })
  intense_points!: number;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  fcm!: string;

  @Column({ type: 'int', nullable: true, default: '0' })
  study_level!: number;

  @Column({ type: 'char', nullable: true, default: '0' })
  language!: string;

  @Column({ type: 'varchar', nullable: true, default: 'user' })
  role!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  invite_code!: string;

  @Column({ type: 'varchar', nullable: true, default: '0' })
  status!: string;

  @Column({ nullable: true, default: '0' })
  subscribed!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => Quiz, (quiz) => quiz.user_id)
  quizzes!: Quiz[];

  @OneToMany(() => UserActivities, (userActivities) => userActivities.user_id)
  userActivities!: UserActivities[];

  @OneToMany(() => Notification, (notification) => notification.user_id)
  notifications!: Notification;

  @OneToMany(() => UserGroupChat, (userGroupChat) => userGroupChat.user_id)
  usergroupchat!: UserGroupChat;

  @OneToMany(() => Category, (category) => category.user_id)
  category!: Category;

  @OneToMany(() => QuizResult, (quizResult) => quizResult.user)
  quizResults: QuizResult[];
}
