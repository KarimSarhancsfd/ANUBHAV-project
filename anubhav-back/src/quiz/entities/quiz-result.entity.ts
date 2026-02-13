import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Quiz } from './quiz.entity';
import { User } from '../../user/entities/user.entity';
import { SchoolSubject } from '../../school-subject/entities/school-subject.entity';

export interface ResultDetail {
  questionId: number;
  isCorrect: boolean;
  mark: number;
  correctAnswer: number;
  userAnswer: number;
}

@Entity()
export class QuizResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.results)
  quiz: Quiz;

  @ManyToOne(() => User, (user) => user.quizResults)
  user: User;

  @ManyToOne(() => SchoolSubject, (subject) => subject.quizResults)
  subject: SchoolSubject;

  @Column()
  totalScore: number;

  @Column({ type: 'json'})
  details: ResultDetail[];

  get subjectName(): string {
    return this.subject?.subject || '';
  }
}


// http://localhost:3000/quiz/submitAnswer/1