import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthPayload, IAuthPayload } from 'auth/auth.decorator';
import { JwtAuthGuard } from 'auth/jwt-auth-guard';
import {
  INotificationOperation,
  NotificationQueryParamsDTO,
} from './dto/find-notication.dto';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get('/')
  async findMyNoti(
    @Query() q: NotificationQueryParamsDTO,
    @AuthPayload() authPayload: IAuthPayload,
  ): Promise<Notification[]> {
    const createNotificationDto: INotificationOperation =
      this.notificationService.parseQueryString(q);
    return await this.notificationService.findAll(
      createNotificationDto,
      authPayload,
    );
  }

  @Post('/')
  async updateSeeStatus(@AuthPayload() authPayload: IAuthPayload) {
    return await this.notificationService.updateSeen(authPayload);
  }
}
