import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Quiz } from './quiz.entity';
import { User } from '../../user/entities/user.entity';

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

  @Column()
  totalScore: number;

  @Column({ type: 'json'})
  details: ResultDetail[];
}


// http://localhost:3000/quiz/submitAnswer/1