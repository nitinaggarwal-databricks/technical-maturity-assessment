import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

/**
 * JWT Authentication Guard
 * 
 * Validates Bearer token and extracts user context:
 * - userId (sub)
 * - email
 * - roles: ['databricks_internal', 'customer_exec', 'customer_member', 'admin']
 * - customerIds: string[] (for multi-tenant access)
 * - isAdmin: boolean
 * 
 * Usage:
 *   @UseGuards(JwtAuthGuard)
 *   @Get()
 *   findAll(@Req() req) {
 *     const user = req.user; // { sub, email, roles, customerIds, ... }
 *   }
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers['authorization'];
    
    if (!auth?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    
    const token = auth.slice('Bearer '.length);
    
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      req.user = payload; // { sub, email, roles, customerIds, isAdmin, ... }
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

