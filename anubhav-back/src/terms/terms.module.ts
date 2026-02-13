import { Module } from '@nestjs/common';
import { TermsService } from './terms.service';
import { TermsController } from './terms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Term } from './entities/term.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Term])], 
  controllers: [TermsController],
  providers: [TermsService],
})
export class TermsModule {}
