import { SchoolSubject } from "src/school-subject/entities/school-subject.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserSubject {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user_id: User

    @ManyToOne(() => SchoolSubject, (schoolSubject) => schoolSubject.id)
    @JoinColumn({ name: 'subject_id' })
    subject_id: SchoolSubject

    @Column()
    row_3: string
}
