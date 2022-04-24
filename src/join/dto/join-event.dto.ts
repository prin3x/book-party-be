import { IsNumber } from 'class-validator';

export class JoinEventDTO {
  @IsNumber()
  partyId: number;

  @IsNumber()
  totalGuest: number;
}
