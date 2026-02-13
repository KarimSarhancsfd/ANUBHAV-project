import { Country } from "src/country/entities/country.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,OneToMany } from "typeorm";
import { QuizResult } from '../../quiz/entities/quiz-result.entity';

@Entity()
export class SchoolSubject {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Country, (country) => country.id)
    @JoinColumn({ name: 'country_id' })
    country_id: Country


    @Column()
    semester: string
    
    @Column()
    subject!: string;

    @Column()
    book_url: string

    @Column()
    video_url: string

    @Column()
    file_url: string

    @OneToMany(() => QuizResult, (quizResult) => quizResult.subject)
    quizResults: QuizResult[];
}
