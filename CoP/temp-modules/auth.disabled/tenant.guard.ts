import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/**
 * Multi-Tenant Guard
 * 
 * Ensures user can only access resources for their customer(s).
 * 
 * Logic:
 * - Admin & databricks_internal: bypass (see all customers)
 * - Customer users: req.body.customerId or resource.customerId must be in user.customerIds
 * 
 * Usage (in service methods):
 *   const allowed = this.tenantGuard.checkAccess(user, cop.customerId);
 *   if (!allowed) throw new ForbiddenException('Access denied');
 */
@Injectable()
export class TenantGuard {
  /**
   * Check if user can access a given customer's data
   */
  canAccessCustomer(user: any, customerId: string): boolean {
    // Admin and internal users see everything
    if (user.isAdmin || user.roles?.includes('databricks_internal')) {
      return true;
    }

    // Customer users: check customerIds array
    const allowedCustomerIds: string[] = user.customerIds ?? [];
    return allowedCustomerIds.includes(customerId);
  }

  /**
   * Throw if user cannot access customer
   */
  enforceCustomerAccess(user: any, customerId: string): void {
    if (!this.canAccessCustomer(user, customerId)) {
      throw new ForbiddenException(
        'You do not have access to this customer',
      );
    }
  }

  /**
   * Filter list of resources by customer access
   */
  filterByCustomerAccess<T extends { customerId: string }>(
    user: any,
    resources: T[],
  ): T[] {
    if (user.isAdmin || user.roles?.includes('databricks_internal')) {
      return resources;
    }

    const allowedCustomerIds: string[] = user.customerIds ?? [];
    return resources.filter((r) =>
      allowedCustomerIds.includes(r.customerId),
    );
  }
}

