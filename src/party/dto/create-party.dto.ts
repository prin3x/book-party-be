import { IsNumber, IsNumberString, IsString } from 'class-validator';

export class CreatePartyDTO {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumberString()
  capacity: number;

  @IsString()
  startDate: Date;

  @IsNumberString()
  duration: number;

  file: Express.Multer.File;
}
