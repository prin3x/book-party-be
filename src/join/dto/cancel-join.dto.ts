import { PartialType } from '@nestjs/mapped-types';
import { IsNumber } from 'class-validator';
import { JoinEventDTO } from './join-event.dto';

export class CancelJoinEventDTO extends PartialType(JoinEventDTO) {
  @IsNumber()
  partyId: number;
}
