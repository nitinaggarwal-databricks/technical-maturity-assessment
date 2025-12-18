import { Module, Global } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { TenantGuard } from './tenant.guard';

/**
 * Auth Module
 * 
 * Provides authentication and authorization infrastructure:
 * - JwtAuthGuard: validates JWT tokens
 * - RolesGuard: enforces role-based access control
 * - TenantGuard: enforces multi-tenant isolation
 * 
 * Import this module globally so guards are available everywhere.
 */
@Global()
@Module({
  providers: [JwtAuthGuard, RolesGuard, TenantGuard],
  exports: [JwtAuthGuard, RolesGuard, TenantGuard],
})
export class AuthModule {}

