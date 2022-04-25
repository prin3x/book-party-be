import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsString } from 'class-validator';
import { CreatePartyDTO } from './create-party.dto';

export class UpdatePartyDTO extends PartialType(CreatePartyDTO) {
    @IsString()
    id: string;
}
