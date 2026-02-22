import { MatchSession } from "src/match-sessions/entities/match-session.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ChallengeUnit {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => MatchSession, (quiz) => quiz.id)
    @JoinColumn({ name: 'quiz_id'})
    quiz_id: MatchSession

    /** @deprecated Use eventTrigger for gaming context */
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

    /** @deprecated Use payloadSignature for gaming context */
    @Column()
    correct_answer_index: number

    /** @deprecated Use challengeWeight for gaming context */
    @Column()
    mark_value!: number

    // --- Semantic Aliases for Gaming Architecture ---

    get eventTrigger(): string { return this.question; }
    get payloadSignature(): number { return this.correct_answer_index; }
    get challengeWeight(): number { return this.mark_value; }
}
