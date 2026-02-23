/**
 * @file UserActivities Service
 * @description Business logic for managing user activities
 */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActivities} from './entities/useractivities.entity';
import { CreateUserActivitiesDto } from './dto/create-useractivities.dto';
import { UpdateUserActivitiesDto} from './dto/update-useractivities.dto';


/**
 * @class UserActivitiesService
 * @description Service layer for user activities business logic
 */
@Injectable()
export class UserActivitiesService {
  constructor(
    @InjectRepository(UserActivities)
    public useractivitiesRepository: Repository<UserActivities>,
  ) {}

  /**
   * @method create
   * @description Creates a new user activity record in the database
   * @param {CreateUserActivitiesDto} createUSERACTIVITIESDto - The data for creating the user activity
   * @returns {Promise<UserActivities>} The newly created user activity
   * @throws {HttpException} When duplicate entry or database query fails
   */
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

  /**
   * @method findAll
   * @description Retrieves all user activity records from the database
   * @returns {Promise<UserActivities[]>} Array of all user activities
   * @throws {HttpException} When database query fails
   */
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

  /**
   * @method findOne
   * @description Retrieves a single user activity by its ID
   * @param {number} id - The ID of the user activity to retrieve
   * @returns {Promise<UserActivities | null>} The user activity or null if not found
   * @throws {HttpException} When database query fails
   */
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

  /**
   * @method update
   * @description Updates an existing user activity record
   * @param {number} id - The ID of the user activity to update
   * @param {UpdateUserActivitiesDto} updateUSERACTIVITIESDto - The data for updating the user activity
   * @returns {Promise<void>} No content on successful update
   * @throws {HttpException} When user activity not found or database query fails
   */
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

  /**
   * @method remove
   * @description Deletes a user activity record from the database
   * @param {number} id - The ID of the user activity to delete
   * @returns {Promise<void>} No content on successful deletion
   * @throws {HttpException} When user activity not found or database query fails
   */
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
