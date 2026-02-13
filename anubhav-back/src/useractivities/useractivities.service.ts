import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivities} from './entities/useractivities.entity';
import { CreateUserActivitiesDto } from './dto/create-useractivities.dto';
import { UpdateUserActivitiesDto} from './dto/update-useractivities.dto';


@Injectable()
export class UserActivitiesService {
  constructor(
    @InjectRepository(UserActivities)
    public useractivitiesRepository: Repository<UserActivities>,
  ) {}
  async create(createUSERACTIVITIESDto: CreateUserActivitiesDto ) {
    try {
      const newUSERACTIVITIES = this.useractivitiesRepository.create(
        createUSERACTIVITIESDto,
      );
      const savedUSERACTIVITIES =
        await this.useractivitiesRepository.save(newUSERACTIVITIES);
      return savedUSERACTIVITIES;
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Duplicate entry : A useractivities with this unique field already exists.',
          HttpStatus.CONFLICT,
        );
      }
      if (error.code === 'QUERY_FAILEDError') {
        throw new HttpException(
          `Query failed:  + ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        error.message || 'Failed to create useractivities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.useractivitiesRepository.find();
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Duplicate entry : A useractivities with this unique field already exists.',
          HttpStatus.CONFLICT,
        );
      }
      if (error.code === 'QUERY_FAILEDError') {
        throw new HttpException(
          `Query failed:  + ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        error.message || 'Failed to create useractivities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      return await this.useractivitiesRepository.findOneBy({ id });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Duplicate entry : A useractivities with this unique field already exists.',
          HttpStatus.CONFLICT,
        );
      }
      if (error.code === 'QUERY_FAILEDError') {
        throw new HttpException(
          `Query failed:  + ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        error.message || 'Failed to create useractivities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, updateUSERACTIVITIESDto: UpdateUserActivitiesDto) {
    try {
      const updateResult = await this.useractivitiesRepository.update(
        id,
        updateUSERACTIVITIESDto,
      );
      if (updateResult.affected === 0) {
        throw new HttpException(
          'USERACTIVITIES not found',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Duplicate entry : A useractivities with this unique field already exists.',
          HttpStatus.CONFLICT,
        );
      }
      if (error.code === 'QUERY_FAILEDError') {
        throw new HttpException(
          `Query failed:  + ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        error.message || 'Failed to create useractivities',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      const deleteResult = await this.useractivitiesRepository.delete(id);
      if (deleteResult.affected === 0) {
        throw new HttpException(
          'USERACTIVITIES not found',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpException(
          'Duplicate entry : A useractivities with this unique field already exists.',
          HttpStatus.CONFLICT,
        );
      }
      if (error.code === 'QUERY_FAILEDError') {
        throw new HttpException(
          `Query failed:  + ${error.message}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        error.message || 'Failed to create user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
