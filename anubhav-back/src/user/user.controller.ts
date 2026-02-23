/**
 * @file user.controller.ts
 * @description User controller handling all user-related HTTP endpoints.
 * Provides authentication (register/login), CRUD operations, and role-based access control.
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user-dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from 'src/auth/decorator/roles.decorator';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

/**
 * @class UserController
 * @description Controller for user management endpoints.
 * Requires Bearer token authentication for protected routes.
 */
@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * @route POST /user/auth/register
   * @description Creates a new user account.
   * @param {CreateUserDto} createUserDto - User registration data
   * @returns {Object} Created user with access token
   */
  @Post('auth/register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /**
   * @route POST /user/auth/login
   * @description Authenticates user and returns access token.
   * @param {LoginUserDto} loginUserDto - User credentials (email, password)
   * @returns {Object} Access token on successful login
   */
  @Post('auth/login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto)
  }

  /**
   * @route GET /user
   * @description Retrieves all users (paginated). Admin only.
   * @security JwtAuthGuard, RolesGuard - requires admin role
   * @returns {Object} Paginated list of users
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('admin')
  @Get()
  findAll(@Req() req: Request) {
    return this.userService.findAll();
  }

  /**
   * @route GET /user/:id
   * @description Retrieves a single user by ID.
   * @param {string} id - User ID
   * @returns {Object} User data
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  /**
   * @route PATCH /user/:id
   * @description Updates user information.
   * @param {string} id - User ID
   * @param {UpdateUserDto} updateUserDto - Updated user data
   * @returns {Object} Updated user data
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  /**
   * @route DELETE /user/:id
   * @description Deletes a user account. Requires authentication.
   * @security JwtAuthGuard - requires valid JWT token
   * @param {string} id - User ID
   * @param {Request} req - Request object with authenticated user
   * @returns {Object} Deletion confirmation
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    console.log(req.user);
    return this.userService.remove(+id, req.user);
  }
}
