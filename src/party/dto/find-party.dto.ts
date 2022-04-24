import { IsOptional, IsString } from 'class-validator';
import { ISimpleOperation, SimpleQueryParamsDTO } from 'utils/simple-query.dto';

export class PartyQueryParamsDTO extends SimpleQueryParamsDTO {
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  startDate: any;
}

export interface IPartyOperation extends ISimpleOperation {}
