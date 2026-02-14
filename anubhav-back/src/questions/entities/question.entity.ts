import { Quiz } from "src/quiz/entities/quiz.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Quiz, (quiz) => quiz.id)
    @JoinColumn({ name: 'quiz_id'})
    quiz_id: Quiz

    @Column()
    question: string

    @Column()
    result: boolean

    @Column()
    type: string

    @Column()
    user_answer_index: number

    @Column()
    ai_answer: string

    @Column()
    user_answer: string

    @Column()
    correct_answer_index: number

    @Column()
    mark_value!: number
}
