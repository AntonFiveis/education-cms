import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const QueryAndAuthorizationHeader = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return {
      token: req.headers['authorization'],
      params: req.params,
      query: req.query,
    };
  },
);
