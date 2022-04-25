import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthPayload, IAuthPayload } from 'auth/auth.decorator';
import { JwtAuthGuard } from 'auth/jwt-auth-guard';
import { INotificationOperation } from './dto/find-notication.dto';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('/')
  async findMyNoti(
    @AuthPayload() authPayload: IAuthPayload,
  ): Promise<Notification[]> {
    const createNotificationDto: INotificationOperation =
      {} as INotificationOperation;
    return await this.notificationService.findAll(
      createNotificationDto,
      authPayload,
    );
  }
}
