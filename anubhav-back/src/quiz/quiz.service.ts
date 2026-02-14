import { Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizResult } from './entities/quiz-result.entity';
import {AnswerDto } from './dto/answer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuestionsService } from '../questions/questions.service';
import {
  ErrorStatusCodesEnum,
  Expose,
  SuccessStatusCodesEnum,
} from 'src/classes';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private quizRepo: Repository<Quiz>,
    private readonly response: Expose,
    private questionService: QuestionsService,
    @InjectRepository(QuizResult) 
    private resultRepo: Repository<QuizResult>
  ) { }

  async createQuiz(createQuizDto: CreateQuizDto, user: any): Promise<any> {
    try {
      const { questions, ...data } = createQuizDto
      const newQuiz = this.quizRepo.create({
        ...data,
        user_id: user.userId,
      });
      const result = await this.quizRepo.save(newQuiz);
      questions.map(async (question) => {
        await this.questionService.create({ ...question, quiz_id: result.id } as any);
      });
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'quiz created successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  async findAllQuizzes(): Promise<any> {
    try {
      const result = await this.quizRepo.find({
        relations: { questions: true },
      });
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'quizs fetched successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  async findQuizById(id: number): Promise<any> {
    try {
      const quiz = await this.quizRepo.findOne({ where: { id } });
      if (!quiz)
        return this.response.error(
          ErrorStatusCodesEnum.BadRequest,
          'quiz not found',
        );
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'quiz fetched successfully',
        quiz,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  async updateQuiz(
    id: number,
    updateQuizDto: UpdateQuizDto,
  ): Promise<Quiz | any> {
    try {
      const quiz = await this.findQuizById(id);
      this.quizRepo.merge(quiz, updateQuizDto);
      const result = await this.quizRepo.save(quiz);
      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'quiz updated successfully',
        result,
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  async removeQuiz(id: number): Promise<any> {
    try {
      const quiz = await this.findQuizById(id);
      await this.quizRepo.remove(quiz);
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message || 'server error',
      );
    }
  }

  async submitQuizAnswers(quizId: number, answers: AnswerDto [], userId: number) {
    try {
      const quiz = await this.quizRepo.findOne({ 
        where: { id: quizId },
        relations: ['questions'] 
      });
      
      if (!quiz) {
        return this.response.error(
          ErrorStatusCodesEnum.NotFound,
          'Quiz not found'
        );
      }

      // Evaluate answers and calculate score
      const results = quiz.questions.map(question => {
        const userAnswer = answers.find(a => a.questionId === question.id);
        const isCorrect = userAnswer?.answer === question.correct_answer_index;
        const mark = isCorrect ? question.mark_value : 0;
        
        return {
          questionId: question.id,
          isCorrect,
          mark,
          correctAnswer: question.correct_answer_index,
          userAnswer: userAnswer?.answer
        };
      });
      const totalScore = results.reduce((sum, r) => sum + r.mark, 0);

      
       // Save results to database
      const quizResult = this.resultRepo.create({
        quiz: quiz,
        user: { id: userId } as any,
        totalScore,
        details: results
      });
      
      await this.resultRepo.save(quizResult);

      return this.response.success(
        SuccessStatusCodesEnum.Ok,
        'Quiz submitted successfully',
        {
          quizId,
          totalScore,
          maxPossibleScore: quiz.mark,
          questionResults: results
        }
      );
    } catch (error) {
      return this.response.error(
        ErrorStatusCodesEnum.BadRequest,
        error.message
      );
    }
  }
}

