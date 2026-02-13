import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoryModule } from './category/category.module';
import { TermsModule } from './terms/terms.module';
import { UserModule } from './user/user.module';
import { QuizModule } from './quiz/quiz.module';
import { BooksModule } from './books/books.module';
import { ChatBotModule } from './chat-bot/chat-bot.module';
import { ChatBotMessageModule } from './chat-bot-message/chat-bot-message.module';
import { GroupsModule } from './groups/groups.module';
import { UseractivitiesModule } from './useractivities/useractivities.module';
import { GoogleStrategy } from './google.strategy';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { UserGroupChatModule } from './user_group_chat/user_group_chat.module';
import { QuestionsModule } from './questions/questions.module';
import { SchoolSubjectModule } from './school-subject/school-subject.module';
import { UserSubjectsModule } from './user-subjects/user-subjects.module';
import { ChatGateway } from './chat/chat.gateway';
import { CountryModule } from './country/country.module';
import { AIService } from './ai/ai.service';



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
    BooksModule,
    ChatBotModule,
    ChatBotMessageModule,
    GroupsModule,
    UseractivitiesModule,
    BookmarksModule,
    UserGroupChatModule,
    QuestionsModule,
    SchoolSubjectModule,
    UserSubjectsModule,
    CountryModule,
  ],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy, ChatGateway, AIService],
})
export class AppModule { }

