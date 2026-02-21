import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
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
@Index(['user', 'quiz']) // Optimization for user's history in a specific match type
export class QuizResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.results)
  @Index() // Match filtering
  quiz: Quiz;

  @ManyToOne(() => User, (user) => user.quizResults)
  @Index() // User match history lookup
  user: User;

  @Column()
  totalScore: number;

  @Column({ type: 'json'})
  details: ResultDetail[];
}