import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ChallengeUnitsService } from './challenge-units.service';
import { CreateChallengeUnitDto } from './dto/create-challenge-unit.dto';
import { UpdateChallengeUnitDto } from './dto/update-challenge-unit.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { SubmitQuestionsDto } from './dto/submit_challenge_unit.dto';

@Controller('api/challenge-units')
// @UseGuards(JwtAuthGuard)
export class ChallengeUnitsController {
  constructor(private readonly questionsService: ChallengeUnitsService) {}

  @Post()
  create(@Body() createQuestionDto: CreateChallengeUnitDto) {
    return this.questionsService.create(createQuestionDto);
  }

  @Patch('submitAnswer/:quiz_id')
  submitAnswer(
    @Body() submitQuestionDto: SubmitQuestionsDto,
    @Param('quiz_id', ParseIntPipe) quiz_id: number,
  ) {
    return this.questionsService.submitAnswer(submitQuestionDto, quiz_id);
  }

  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateChallengeUnitDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.remove(id);
  }
}
