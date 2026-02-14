import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { TermsModule } from './terms/terms.module';
import { UserModule } from './user/user.module';
import { QuizModule } from './quiz/quiz.module';
import { GroupsModule } from './groups/groups.module';
import { UseractivitiesModule } from './useractivities/useractivities.module';
import { GoogleStrategy } from './google.strategy';
import { UserGroupChatModule } from './user_group_chat/user_group_chat.module';
import { QuestionsModule } from './questions/questions.module';
import { ChatGateway } from './chat/chat.gateway';
import { CountryModule } from './country/country.module';
import { AIService } from './ai/ai.service';
import { LiveOpsModule } from './live-ops/live-ops.module';



dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UserModule,
    CategoryModule,
    TermsModule,
    QuizModule,
    GroupsModule,
    UseractivitiesModule,
    UserGroupChatModule,
    QuestionsModule,
    CountryModule,
    LiveOpsModule,
  ],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy, ChatGateway, AIService],
})
export class AppModule { }

