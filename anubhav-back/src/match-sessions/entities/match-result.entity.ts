import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { MatchSession } from './match-session.entity';
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
export class MatchResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MatchSession, (quiz) => quiz.results)
  @Index() // Match filtering
  quiz: MatchSession;

  @ManyToOne(() => User, (user) => user.matchResults)
  @Index() // User match history lookup
  user: User;

  @Column()
  totalScore: number;

  @Column({ type: 'json'})
  details: ResultDetail[];
}