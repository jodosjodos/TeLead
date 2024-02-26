import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';

@Injectable()
export class MentorGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles || !roles.includes('MENTOR')) {
      throw new UnauthorizedException(
        'please to access this route you must have MENTOR role',
      );
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    // role is not mentor
    if (user.Role !== 'MENTOR')
      throw new UnauthorizedException(
        'please to access this route you must have MENTOR role',
      );
    return user && user.Role === 'MENTOR';
  }
}
