import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDTO } from './register-user.dto';

export class LoginUserDTO extends PartialType(RegisterUserDTO) {}
