import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class MentorGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles || !roles.includes('MENTOR')) {
      return true; // No roles defined or not MENTOR role, allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(user);

    return user && user.Role === 'MENTOR';
  }
}
