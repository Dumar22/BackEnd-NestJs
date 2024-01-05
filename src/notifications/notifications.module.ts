import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { UsersModule } from 'src/auth/users.module';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService],
  imports: [TypeOrmModule.forFeature([Notification]),
UsersModule],
  exports:[TypeOrmModule]
})
export class NotificationsModule {}
