import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user_id: User;

  /** @deprecated Use className for gaming context */
  @Column()
  name: string;

  /** @deprecated Use classIcon for gaming context */
  @Column({ nullable: true })
  image?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updateAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleteAt: Date;

  // --- Semantic Aliases for Gaming Architecture ---

  get className(): string { return this.name; }
  get classIcon(): string | undefined { return this.image; }
}
