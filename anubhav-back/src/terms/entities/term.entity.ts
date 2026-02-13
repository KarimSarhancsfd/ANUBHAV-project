  import { IsEnum } from 'class-validator';
  import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';

  // enum PolicyType {
  //   PrivacyPolicy = "privacy_policy",
  //   RefundPolicy = "refund_policy",
  //   UsageTerms = "usage_terms",
  //   SecurityPolicy = "security_policy",
  //   SubscriptionTerms = "subscription_terms"
  // }
  
  // enum TermType {
  //   ShortTerm = "short_term",
  //   LongTerm = "long_term",
  //   TrialTerm = "trial_term",
  //   CustomTerm = "custom_term"
  // }


  @Entity()
  export class Term {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    policy: string;

    @IsEnum({})
    @Column()
    term: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
  }
