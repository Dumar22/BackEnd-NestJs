import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  async sendNotification(message: string, senderId: string, receiverId: string): Promise<Notification> {
    const notification = this.notificationRepository.create({
      message,
      sender: { id: senderId },
      receiver: { id: receiverId },
    });
    return await this.notificationRepository.save(notification);
  }

  async getNotificationsForUser(userId: string): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { receiver: { id: userId } },
      relations: ['sender', 'receiver'],
    });
  }

  // Implementa otros métodos según tus necesidades
}
