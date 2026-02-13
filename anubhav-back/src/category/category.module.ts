import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './entities/category.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { multerCofig } from 'src/util/multer';
import { Expose } from 'src/classes';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    MulterModule.register(multerCofig)
  ],
  controllers: [CategoryController],
  providers: [CategoryService, Expose],
})
export class CategoryModule { }
