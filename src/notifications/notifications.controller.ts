import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('/:receiverId')
  @Auth()
  async sendNotification(
    @Body('message') message: string,
    @Param('receiverId') receiverId: string,
    @GetUser() sender: User,
  ) {
    return this.notificationsService.sendNotification(message, sender.id, receiverId);
  }

  @Get()
  @Auth()
  async getNotifications(@GetUser() user: User) {
    return this.notificationsService.getNotificationsForUser(user.id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
  //   return this.notificationsService.update(+id, updateNotificationDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.notificationsService.remove(+id);
  // }
}
