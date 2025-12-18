import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * Roles Guard for RBAC
 * 
 * Checks if user has at least one of the required roles.
 * Use with JwtAuthGuard to ensure user is authenticated first.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
    
    // No roles required = public access (but still needs auth if JwtAuthGuard is applied)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRoles: string[] = user.roles ?? [];
    const isAdmin = user.isAdmin === true;

    // Admin bypasses all role checks
    if (isAdmin) return true;

    // Check if user has at least one required role
    const allowed = requiredRoles.some((r) => userRoles.includes(r));
    
    if (!allowed) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredRoles.join(' or ')}`,
      );
    }
    
    return true;
  }
}

