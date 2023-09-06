import { tokenService } from '../services/token.service';
import { decorator } from '../utils/decorator.util';

// export const UserIdIfHasToken = createParamDecorator((_, ctx: ExecutionContext) => {
//   const req = request(ctx);
//   if (tokenService.getToken(req) && tokenService.getToken(req) !== 'undefined')
//     return tokenService.emailAndRoles(req).id;
//   return null;
// });

// export const Token = createParamDecorator((_, ctx: ExecutionContext) => {
//   const req = request(ctx);
//   return tokenService.getToken(req);
// });
//
// export const UserId = createParamDecorator((_, ctx: ExecutionContext) => {
//   const req = request(ctx);
//   return tokenService.emailAndRoles(req).id;
// });

// export const UserId = decorator((req) => tokenService.emailAndRoles(req).id);
//
// export const UserIdIfHasToken = decorator((req) => {
//   if (tokenService.getToken(req) && tokenService.getToken(req) !== 'undefined')
//     return tokenService.emailAndRoles(req).id;
//   return null;
// });
//
// export const Token = decorator((req) => tokenService.getToken(req));

export const Token = decorator((req) => tokenService.getToken(req));
export const UserId = decorator((req) => tokenService.emailAndRoles(req).id);
export const Roles = decorator((req) => tokenService.emailAndRoles(req).roles);

export const UserIdIfHasToken = decorator((req) => {
  try {
    return tokenService.emailAndRoles(req).id;
  } catch (e) {
    console.log('UserIdIfHasToken error');
    return null;
  }
});
