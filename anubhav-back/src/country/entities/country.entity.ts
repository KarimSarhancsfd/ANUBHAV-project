import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => User, (user) => user.country_id)
  user_id: User[]

  @Column()
  name!: string;

  @Column()
  imageUrl!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @OneToMany(() => User, user => user.country_id)
  users: User[]
}
