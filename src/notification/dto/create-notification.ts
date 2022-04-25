import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ENotificationType } from 'notification/entities/notification.entity';

export class CreateNotificationDTO {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(ENotificationType)
  type?: ENotificationType;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsNumber()
  for: number;
}
