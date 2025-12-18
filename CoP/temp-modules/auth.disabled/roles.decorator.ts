import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator for RBAC
 * 
 * Usage:
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   @Roles('admin', 'databricks_internal')
 *   @Post()
 *   create() { ... }
 * 
 * Roles hierarchy:
 * - admin: Full platform access
 * - databricks_internal: All customers, internal features
 * - customer_exec: Customer-level admin (their CoPs only)
 * - customer_member: CoP member (their CoPs only)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

