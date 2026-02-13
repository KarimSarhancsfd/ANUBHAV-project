import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
  ) {}

  create(createDto: CreateNotificationDto) {
    const notification = this.notificationRepo.create(createDto);
    return this.notificationRepo.save(notification);
  }

  findAll() {
    return this.notificationRepo.find();
  }

  findOne(id: number) {
    return this.notificationRepo.findOne({ where: { id } });
  }

  update(id: number, updateDto: UpdateNotificationDto) {
    return this.notificationRepo.update(id, updateDto);
  }

  remove(id: number) {
    return this.notificationRepo.delete(id);
  }
}
