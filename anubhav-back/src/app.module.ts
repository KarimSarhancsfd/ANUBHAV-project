import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { CategoryModule } from './category/category.module';
// import { TermsModule } from './terms/terms.module';
import { UserModule } from './user/user.module';
// import { QuizModule } from './quiz/quiz.module';
import { GroupsModule } from './groups/groups.module';
import { UseractivitiesModule } from './useractivities/useractivities.module';
import { GoogleStrategy } from './google.strategy';
import { UserGroupChatModule } from './user_group_chat/user_group_chat.module';
// import { QuestionsModule } from './questions/questions.module';
import { ChatModule } from './chat/chat.module';
import { CountryModule } from './country/country.module';
// import { AIService } from './ai/ai.service';
import { LiveOpsModule } from './live-ops/live-ops.module';
import { PlayerProgressModule } from './player-progress/player-progress.module';
import { EconomyModule } from './economy/economy.module';
import { CommonModule } from './common/common.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],

      // PERF: Keep synchronize:true for dev convenience.
      // ⚠️ PRODUCTION: Set to false and use TypeORM migrations instead.
      synchronize: true,

      // PERF: Set connection pool limits. Default is 10 but explicit config
      // ensures predictable behaviour under concurrent load.
      extra: {
        connectionLimit: 10,
      },

      // PERF: Log queries that exceed 1000ms so slow queries surface
      // immediately during development and staging.
      maxQueryExecutionTime: 1000,

      // PERF: In production, set logging to ['error'] to avoid overhead.
      // maxQueryExecutionTime above handles slow query detection automatically.
      logging: process.env.NODE_ENV === 'development'
        ? ['query', 'error']
        : ['error'],
    }),

    // CommonModule exports AppCacheService globally — used across all modules
    CommonModule,

    UserModule,
    // CategoryModule,
    // TermsModule,
    // QuizModule,
    GroupsModule,
    UseractivitiesModule,
    UserGroupChatModule,
    // QuestionsModule,
    CountryModule,
    LiveOpsModule,
    PlayerProgressModule,
    EconomyModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy, /*AIService*/],
})
export class AppModule { }
