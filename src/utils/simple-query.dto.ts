import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class SimpleQueryParamsDTO {
  @IsNumberString()
  @IsOptional()
  page: number;

  @IsNumberString()
  @IsOptional()
  limit: number;

  @IsString()
  @IsOptional()
  orderBy: string;

  @IsString()
  @IsOptional()
  order: string;

  @IsString()
  @IsOptional()
  search: string;
}

export interface ISimpleOperation {
  page: number;
  skip: number;
  limit: number;
  orderBy: string;
  order: 'ASC' | 'DESC';
  search: string;
  startDate?: string;
  endDate?: string;
}
