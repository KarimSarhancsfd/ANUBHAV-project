/**
 * @file Notifications Controller
 * @description REST API endpoints for notification management
 */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

/**
 * @class NotificationsController
 * @description Handles HTTP requests for notification operations
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * @method create
   * @description Creates a new notification
   * @param {CreateNotificationDto} createDto - The notification data
   * @returns {Promise<Notification>} The created notification
   */
  @Post()
  create(@Body() createDto: CreateNotificationDto) {
    return this.notificationsService.create(createDto);
  }

  /**
   * @method findAll
   * @description Retrieves all notifications
   * @returns {Promise<Notification[]>} Array of all notifications
   */
  @Get()
  findAll() {
    return this.notificationsService.findAll();
  }

  /**
   * @method findOne
   * @description Retrieves a single notification by ID
   * @param {string} id - The notification ID
   * @returns {Promise<Notification>} The requested notification
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  /**
   * @method update
   * @description Updates an existing notification
   * @param {string} id - The notification ID
   * @param {UpdateNotificationDto} updateDto - The updated notification data
   * @returns {Promise<UpdateResult>} The update result
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateNotificationDto) {
    return this.notificationsService.update(+id, updateDto);
  }

  /**
   * @method remove
   * @description Deletes a notification by ID
   * @param {string} id - The notification ID
   * @returns {Promise<DeleteResult>} The deletion result
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
