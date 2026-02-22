import { ChallengeUnit } from 'src/challenge-units/entities/challenge-unit.entity';
import { User } from 'src/user/entities/user.entity';
import { MatchResult } from './match-result.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum QuizQuestionsType {
  MultiChoic = 'MultiChoic',
  TrueFalse = 'TrueFalse',
  Writing = 'Writing',
  Random = 'random',
}

export enum QuizLevel {
  Ease = 'ease',
  Medium = 'medium',
  Hard = 'hard',
  Random = 'random',
}

export enum MatchMode {
  Solo = 'solo',
  PvP = 'pvp',
  Event = 'event',
  Ranked = 'ranked',
}

@Entity()
export class MatchSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user_id!: User;

  @Column()
  name!: string;

  /** @deprecated Use baseReward for gaming context */
  @Column()
  mark!: number;

  @Column()
  question_type!: QuizQuestionsType;

  @Column()
  question_level!: QuizLevel;

  @Column({ type: 'enum', enum: MatchMode, default: MatchMode.Solo })
  mode: MatchMode;

  @Column()
  status!: boolean;

  @Column()
  total_questions!: number;

  /** @deprecated Use sessionDuration for gaming context */
  @Column()
  total_time!: Date;

  @Column()
  total_mark!: number;

  @Column()
  created_at!: Date;

  @Column()
  updated_at!: Date;

  @Column()
  deleted_at!: Date;

  @OneToMany(() => ChallengeUnit, (question) => question.quiz_id)
  questions: ChallengeUnit[];

  @OneToMany(() => MatchResult, (quizResult) => quizResult.quiz)
  results: MatchResult[];

  // --- Semantic Aliases for Gaming Architecture ---

  get matchName(): string { return this.name; }
  get baseReward(): number { return this.mark; }
  get sessionDuration(): Date { return this.total_time; }
  get challengeCount(): number { return this.total_questions; }
}
