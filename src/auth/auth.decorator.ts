import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface IAuthPayload {
  id: number;
  name: string;
  createdDate: Date;
}

export const AuthPayload = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
