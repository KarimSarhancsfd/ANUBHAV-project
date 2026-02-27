import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { CategoryModule } from './category/category.module';
// import { TermsModule } from './terms/terms.module';
import { UserModule } from './user/user.module';
import { MatchSessionsModule } from './match-sessions/match-sessions.module';
import { GroupsModule } from './groups/groups.module';
import { UseractivitiesModule } from './useractivities/useractivities.module';
import { GoogleStrategy } from './google.strategy';
import { UserGroupChatModule } from './user_group_chat/user_group_chat.module';
// import { LoggerMiddleware } from './middleware/logger.middleware';
import { ChallengeUnitsModule } from './challenge-units/challenge-units.module';
import { ChatModule } from './chat/chat.module';
import { CountryModule } from './country/country.module';
// import { AIService } from './ai/ai.service';
// import { AIController } from './ai/ai.controller';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notification/notifications.module';
import { LiveOpsModule } from './live-ops/live-ops.module';
import { PlayerProgressModule } from './player-progress/player-progress.module';
import { EconomyModule } from './economy/economy.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'true', // Critical for safety
      extra: {
        connectionLimit: 50, // Optimal for gaming scale
      },
    }),
    AuthModule,
    UserModule,
    // CategoryModule,
    // TermsModule,
    MatchSessionsModule,
    GroupsModule,
    UseractivitiesModule,
    UserGroupChatModule,
    ChallengeUnitsModule,
    CountryModule,
    LiveOpsModule,
    PlayerProgressModule,
    EconomyModule,
    NotificationsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
