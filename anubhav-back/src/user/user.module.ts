import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LanguageManager } from 'src/classes/ResponseLangValidator';
import { Expose } from 'src/classes';
import { AuthModule } from 'src/auth/auth.module';



@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService, LanguageManager, Expose],
  exports: [UserService]
})
export class UserModule { }
