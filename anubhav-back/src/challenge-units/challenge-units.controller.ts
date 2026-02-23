/**
 * @file challenge-units.controller.ts
 * @description Controller for handling challenge unit HTTP requests
 */
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

/**
 * @description Controller for managing challenge units API endpoints
 */
@Controller('api/challenge-units')
// @UseGuards(JwtAuthGuard)
export class ChallengeUnitsController {
  /**
   * @description Creates an instance of ChallengeUnitsController
   * @param {ChallengeUnitsService} questionsService - Service for challenge unit operations
   */
  constructor(private readonly questionsService: ChallengeUnitsService) {}

  /**
   * @description Creates a new challenge unit
   * @param {CreateChallengeUnitDto} createQuestionDto - DTO containing challenge unit data
   * @returns {Promise<any>} Created challenge unit
   */
  @Post()
  create(@Body() createQuestionDto: CreateChallengeUnitDto) {
    return this.questionsService.create(createQuestionDto);
  }

  /**
   * @description Submits answers for a challenge unit quiz
   * @param {SubmitQuestionsDto} submitQuestionDto - DTO containing submitted answers
   * @param {number} quiz_id - ID of the quiz
   * @returns {Promise<any>} Updated challenge unit with user answers
   */
  @Patch('submitAnswer/:quiz_id')
  submitAnswer(
    @Body() submitQuestionDto: SubmitQuestionsDto,
    @Param('quiz_id', ParseIntPipe) quiz_id: number,
  ) {
    return this.questionsService.submitAnswer(submitQuestionDto, quiz_id);
  }

  /**
   * @description Retrieves all challenge units
   * @returns {Promise<any>} Array of all challenge units
   */
  @Get()
  findAll() {
    return this.questionsService.findAll();
  }

  /**
   * @description Retrieves a single challenge unit by ID
   * @param {number} id - ID of the challenge unit
   * @returns {Promise<any>} The challenge unit
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.findOne(id);
  }

  /**
   * @description Updates an existing challenge unit
   * @param {number} id - ID of the challenge unit to update
   * @param {UpdateChallengeUnitDto} updateQuestionDto - DTO containing update data
   * @returns {Promise<any>} Updated challenge unit
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateChallengeUnitDto,
  ) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  /**
   * @description Deletes a challenge unit by ID
   * @param {number} id - ID of the challenge unit to delete
   * @returns {Promise<any>} Deletion confirmation
   */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.questionsService.remove(id);
  }
}
