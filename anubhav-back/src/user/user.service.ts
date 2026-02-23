/**
 * @file user.service.ts
 * @description User service handling all user-related business logic.
 * Provides user CRUD, authentication, password hashing, and token management.
 */
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ErrorStatusCodesEnum, Expose, SuccessStatusCodesEnum } from 'src/classes';
import { AuthService } from 'src/auth/auth.service';
import { LoginUserDto } from './dto/login-user-dto';
import * as bcrypt from 'bcrypt'

/**
 * @class UserService
 * @description Service for user management operations including registration, login, and CRUD.
 */
@Injectable()
export class UserService {

  /**
   * @constructor
   * @param {Repository<User>} userRepository - TypeORM repository for User entity
   * @param {Expose} responce - Response formatting service
   * @param {AuthService} authService - Authentication service for token generation
   */
  constructor(
    @InjectRepository(User) public userRepository: Repository<User>,
    private readonly responce: Expose,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) { }

  /**
   * @method create
   * @description Registers a new user with hashed password.
   * @param {CreateUserDto} createUserDto - User registration data
   * @returns {Object} Success response with access token
   */
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...otherData } = createUserDto
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
      const hashPassword = await bcrypt.hash(password, saltRounds)
      const newUser = this.userRepository.create({
        password: hashPassword,
        ...otherData
      });
      const savedUser = await this.userRepository.save(newUser);
      const access_token = await this.authService.generateAccessToken(savedUser)

      return this.responce.success(SuccessStatusCodesEnum.Created,
        'user created successfully', access_token)
    } catch (error) {
      return this.responce.error(ErrorStatusCodesEnum.BadRequest, error.message)
    }
  }

  /**
   * @method login
   * @description Authenticates user with email and password.
   * @param {LoginUserDto} loginUserDto - User credentials
   * @returns {Object} Access token on successful login
   */
  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto
      const user = await this.userRepository.findOne({ where: { email } })
      if (!user) return this.responce.error(ErrorStatusCodesEnum.NotFound, 'invailed email or password')
      const isUserPassword = await bcrypt.compare(password, user.password)
      if (!isUserPassword) return this.responce.error(ErrorStatusCodesEnum.NotFound, 'invailed email or password')
      const access_token = await this.authService.generateAccessToken(user)
      return this.responce.success(SuccessStatusCodesEnum.Ok, 'login successfully', access_token)
    } catch (error) {
      return this.responce.error(ErrorStatusCodesEnum.BadRequest, error.message)
    }
  }

  /**
   * @method findAll
   * @description Retrieves all users with pagination.
   * @param {number} limit - Maximum records to return (default 20, max 100)
   * @param {number} offset - Number of records to skip
   * @returns {Object} Paginated user list with total count
   */
  async findAll(limit = 20, offset = 0) {
    try {
      const [result, total] = await this.userRepository.findAndCount({
        take: Math.min(limit, 100),
        skip: offset,
        order: { id: 'ASC' },
      });
      return this.responce.success(SuccessStatusCodesEnum.Ok,
        'all user fetched successfully', { data: result, total, limit, offset })
    } catch (error) {
      return this.responce.error(ErrorStatusCodesEnum.BadRequest, error.message)
    }
  }

  /**
   * @method findOne
   * @description Retrieves a single user by ID.
   * @param {number} id - User ID
   * @returns {Object} User data
   */
  async findOne(id: number) {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) return this.responce.error(ErrorStatusCodesEnum.NotFound, 'user not found')
      return this.responce.success(SuccessStatusCodesEnum.Ok,
        'user fetched sucessfully', user)
    } catch (error) {
      return this.responce.error(ErrorStatusCodesEnum.BadRequest, error.message)
    }
  }

  /**
   * @method update
   * @description Updates user information.
   * @param {number} id - User ID
   * @param {UpdateUserDto} updateUserDto - Updated user data
   * @returns {Object} Updated user data
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOne(id)
      const updateUser = this.userRepository.merge(user.data, updateUserDto);
      const result = await this.userRepository.save(updateUser)
      return this.responce.success(SuccessStatusCodesEnum.Ok,
        'user updated sccessfully', result)
    } catch (error) {
      return this.responce.error(ErrorStatusCodesEnum.BadRequest, error.message)
    }
  }

  /**
   * @method remove
   * @description Deletes a user account. Only the user themselves or an admin can delete.
   * @param {number} id - User ID to delete
   * @param {Object} payload - Authenticated user payload (contains userId and role)
   * @returns {Object} Deletion confirmation
   */
  async remove(id: number, payload: any) {
    try {
      const user = await this.findOne(id)
      if (user.data.id == payload.userId || payload.role == 'admin') {
        await this.userRepository.remove(user.data);
        return this.responce.notify(SuccessStatusCodesEnum.Ok,
          'user deleted successfully')
      } else {
        return this.responce.error(ErrorStatusCodesEnum.BadRequest, 'you are not allowed')
      }
    } catch (error) {
      return this.responce.error(ErrorStatusCodesEnum.BadRequest, error.message)
    }

  }

  /**
   * @method updateToken
   * @description Updates user's authentication token.
   * @param {number} userId - User ID
   * @param {string} refreshToken - New authentication token
   */
  async updateToken(userId: number, refreshToken: string) {
    await this.userRepository.update(userId, {
      token: refreshToken
    });

  }
}
