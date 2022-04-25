import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ENotificationType } from 'notification/entities/notification.entity';
import { ISimpleOperation, SimpleQueryParamsDTO } from 'utils/simple-query.dto';

export class NotificationQueryParamsDTO extends SimpleQueryParamsDTO {
  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(ENotificationType)
  type: ENotificationType;
}

export interface INotificationOperation extends ISimpleOperation {
  content?: string;
  type?: string;
}
