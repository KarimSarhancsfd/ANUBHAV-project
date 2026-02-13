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
// import { LanguageManager } from 'src/classes/ResponseLangValidator';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User) public userRepository: Repository<User>,
    private readonly responce: Expose,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...otherData } = createUserDto
      const hashPassword = await bcrypt.hash(password, 10)
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

  async findAll() {
    try {
      const result = await this.userRepository.find();
      return this.responce.success(SuccessStatusCodesEnum.Ok,
        'all user fetched successfully', result)
    } catch (error) {
      return this.responce.error(ErrorStatusCodesEnum.BadRequest, error.message)
    }
  }


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

  async updateToken(userId: number, refreshToken: string) {
    await this.userRepository.update(userId, {
      token: refreshToken
    });

  }
}
