/**
 * @file UserActivities Controller
 * @description HTTP request handler for user activities endpoints
 */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserActivitiesService } from './useractivities.service';
import { CreateUserActivitiesDto } from './dto/create-useractivities.dto';
import { UpdateUserActivitiesDto } from './dto/update-useractivities.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

/**
 * @class UserActivitiesController
 * @description Controller for handling user activities HTTP requests
 */
@Controller('useractivities')
@UseGuards(JwtAuthGuard)
export class UserActivitiesController {
  constructor(private readonly userActivitiesService: UserActivitiesService) {}

  /**
   * @method create
   * @description Creates a new user activity record
   * @param {CreateUserActivitiesDto} createUserActivitiesDto - The data for creating the user activity
   * @returns {Promise<UserActivities>} The created user activity
   */
  @Post()
  create(@Body() createUserActivitiesDto: CreateUserActivitiesDto) {
    return this.userActivitiesService.create(createUserActivitiesDto);
  }

  /**
   * @method findAll
   * @description Retrieves all user activity records
   * @returns {Promise<UserActivities[]>} Array of all user activities
   */
  @Get()
  findAll() {
    return this.userActivitiesService.findAll();
  }

  /**
   * @method findOne
   * @description Retrieves a single user activity by ID
   * @param {string} id - The ID of the user activity to retrieve
   * @returns {Promise<UserActivities>} The user activity with the specified ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userActivitiesService.findOne(+id);
  }

  /**
   * @method update
   * @description Updates an existing user activity record
   * @param {string} id - The ID of the user activity to update
   * @param {UpdateUserActivitiesDto} updateUserActivitiesDto - The data for updating the user activity
   * @returns {Promise<void>} No content on successful update
   */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserActivitiesDto: UpdateUserActivitiesDto,
  ) {
    return this.userActivitiesService.update(+id, updateUserActivitiesDto);
  }

  /**
   * @method remove
   * @description Deletes a user activity record
   * @param {string} id - The ID of the user activity to delete
   * @returns {Promise<void>} No content on successful deletion
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userActivitiesService.remove(+id);
  }
}
