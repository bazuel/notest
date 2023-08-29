import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GenericRequest } from '../services/token.service';

export function request(ctx: ExecutionContext): GenericRequest {
  return ctx.switchToHttp().getRequest();
}

// export function decorator(
//   decFun: (req: GenericRequest) => any
// ): (data: unknown, ctx: ExecutionContext) => any {
//   return () => createParamDecorator((_, ctx: ExecutionContext) => {
//     const req = request(ctx);
//     return decFun(req);
//   });
// }

export function decorator(processReq: (req: GenericRequest) => any) {
  return createParamDecorator((_, ctx: ExecutionContext) => {
    const req = request(ctx);
    return processReq(req);
  });
}
