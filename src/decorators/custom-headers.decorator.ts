import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CustomHeaders = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return data ? { token: req.headers[data] } : { token: req.headers };
  },
);

export interface CustomHeadersOutput {
  token: string;
}
