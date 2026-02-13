import { Book } from 'src/books/entities/book.entity';
import { Question } from 'src/questions/entities/question.entity';
import { User } from 'src/user/entities/user.entity';
import { QuizResult } from './quiz-result.entity';
import {SchoolSubject} from 'src/school-subject/entities/school-subject.entity';
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
@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user_id!: User;

  @ManyToOne(() => Book, (book) => book.id)
  @JoinColumn({ name: 'book_id', referencedColumnName: 'id' })
  book_id!: Book;

  @Column()
  name!: string;

  @Column()
  mark!: number;

  @Column()
  question_type!: QuizQuestionsType;

  @Column()
  question_level!: QuizLevel;

  @Column()
  status!: boolean;

  @Column()
  total_questions!: number;

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

  @OneToMany(() => Question, (question) => question.quiz_id)
  questions: Question[];

  //relation with schoole subject
  @ManyToOne(() => SchoolSubject, (subject) => subject.subject)
  @JoinColumn({ name: 'subject_name', referencedColumnName: 'id' })
  subject_name!: SchoolSubject;

  @OneToMany(() => QuizResult, (quizResult) => quizResult.quiz)
  results: QuizResult[];
}
