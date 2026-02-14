import {
  ErrorStatusCodesEnum,
  Expose,
  SuccessStatusCodesEnum,
} from 'src/classes';
import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { In, Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { SubmitQuestionsDto } from './dto/submit_question.dto';
import { error } from 'console';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
    private readonly response: Expose,
  ) {}

  async create(createQuestionDto: CreateQuestionDto & { quiz_id?: any }) {
    try {
      const question = this.questionRepo.create(createQuestionDto as any);
      const result = await this.questionRepo.save(question);
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'question created successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }

  async findAll() {
    try {
      const result = await this.questionRepo.find({
        relations: { quiz_id: true },
      });
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'questions fetched successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }

  async findOne(id: number) {
    try {
      const question = await this.questionRepo.findOne({ where: { id } });
      if (!question)
        return this.response.error(
          ErrorStatusCodesEnum.BadRequest,
          'question not found',
        );
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'questions fetched successfully',
        question,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }

  async submitAnswer(submitQuestionsDto: SubmitQuestionsDto, quizId: number) {
    try {
      const { questions } = submitQuestionsDto;

      // Here we will id of each question submitted
      const questionsIds = questions.map((q) => q.question_id) ;
      // Questions must be found in one specific quiz (existingQuestions) variable
      const existingQuestions = await this.questionRepo.find({where:
        {
          id:In (questionsIds) , 
          quiz_id:{id:quizId } , 
        }
      }) ; 
      // All questions must be submitted
    if(existingQuestions.length !== questions.length){
        return this.response.error(ErrorStatusCodesEnum.BadRequest , 
          'There is a certain question lost...!'
        )  ;  
    }

    const updateQuestions = existingQuestions.map((question)=> {
      // Here I need to specify questions that its
      // answers had been modified
      // So, we will get questions submitted and
      //  questions in same quiz (existingQuestions)
      const updateAnswers = questions.find((q)=> 
            +q.question_id === +question.id
      ) 
      // If we got a not null answers
      if(updateAnswers){
        question.user_answer_index = updateAnswers.user_answer_index ; 
        question.user_answer = updateAnswers.user_answer ; 
      }
      return question
    })  ;
    await this.questionRepo.save(updateQuestions) ; 
    return this.response.success(
      SuccessStatusCodesEnum.Ok , 
      'Quiz questions has been updated successfully' 
    ) ; 
  }catch(error){
    return this.response.error(ErrorStatusCodesEnum.BadRequest,
      `${error.message}`
    ) ; 
  }

  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    try {
      const question = await this.findOne(id);
      const updateQuestion = this.questionRepo.merge(
        question.data,
        updateQuestionDto as any,
      );
      const result = await this.questionRepo.save(updateQuestion);
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'questions fetched successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }

  async remove(id: number) {
    try {
      const question = await this.findOne(id);
      await this.questionRepo.remove(question.data);
      return this.response.notify(
        SuccessStatusCodesEnum.Ok,
        'questions fetched successfully',
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message,
      );
    }
  }
}

