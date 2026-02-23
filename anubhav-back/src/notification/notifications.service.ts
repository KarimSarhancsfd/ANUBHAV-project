/**
 * @file Notifications Service
 * @description Business logic for notification operations
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

/**
 * @class NotificationsService
 * @description Service layer for managing notifications
 */
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  /**
   * @method create
   * @description Creates a new notification record
   * @param {CreateNotificationDto} createDto - The notification data
   * @returns {Promise<Notification>} The created notification
   */
  create(createDto: CreateNotificationDto) {
    const notification = this.notificationRepo.create(createDto);
    return this.notificationRepo.save(notification);
  }

  /**
   * @method findAll
   * @description Retrieves all notification records
   * @returns {Promise<Notification[]>} Array of all notifications
   */
  findAll() {
    return this.notificationRepo.find();
  }

  /**
   * @method findOne
   * @description Retrieves a single notification by ID
   * @param {number} id - The notification ID
   * @returns {Promise<Notification|null>} The requested notification or null
   */
  findOne(id: number) {
    return this.notificationRepo.findOne({ where: { id } });
  }

  /**
   * @method update
   * @description Updates an existing notification
   * @param {number} id - The notification ID
   * @param {UpdateNotificationDto} updateDto - The updated notification data
   * @returns {Promise<UpdateResult>} The update result
   */
  update(id: number, updateDto: UpdateNotificationDto) {
    return this.notificationRepo.update(id, updateDto);
  }

  /**
   * @method remove
   * @description Deletes a notification by ID
   * @param {number} id - The notification ID
   * @returns {Promise<DeleteResult>} The deletion result
   */
  remove(id: number) {
    return this.notificationRepo.delete(id);
  }
}
