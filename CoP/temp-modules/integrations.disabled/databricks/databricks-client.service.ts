import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios, { AxiosInstance } from 'axios';

/**
 * Databricks Client Service
 * 
 * Base service for all Databricks API interactions.
 * Handles authentication, token management, and workspace routing.
 */
@Injectable()
export class DatabricksClientService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get Databricks integration config for a customer
   */
  async getConfig(customerId: string): Promise<any> {
    const integration = await this.prisma.integration.findFirst({
      where: { customerId, type: 'databricks', isActive: true },
    });

    if (!integration) {
      throw new Error(`No Databricks integration for customer ${customerId}`);
    }

    return integration.config;
  }

  /**
   * Get workspace mapping for a specific CoP
   */
  async getWorkspaceForCop(copId: string) {
    // Try CoP-specific mapping first
    const mapping = await this.prisma.workspaceMapping.findFirst({
      where: { copId, isActive: true },
      include: { integration: true },
    });

    if (mapping) return mapping;

    // Fallback: get customer-level workspace
    const cop = await this.prisma.cop.findUnique({
      where: { id: copId },
      select: { customerId: true },
    });

    const integration = await this.prisma.integration.findFirst({
      where: { customerId: cop.customerId, type: 'databricks' },
      include: { workspaces: true },
    });

    return integration?.workspaces[0];
  }

  /**
   * Get authenticated API client for a workspace
   */
  async getClient(workspaceUrl: string, config: any): Promise<AxiosInstance> {
    const token = await this.getToken(config);

    return axios.create({
      baseURL: workspaceUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Get access token (handles different auth schemes)
   */
  private async getToken(config: any): Promise<string> {
    if (config.auth_scheme === 'service_principal') {
      return this.getServicePrincipalToken(config);
    }

    if (config.token) {
      return config.token;
    }

    throw new Error('No valid authentication configured');
  }

  /**
   * Get OAuth token using service principal credentials
   */
  private async getServicePrincipalToken(config: any): Promise<string> {
    const tokenUrl = `https://login.microsoftonline.com/${config.tenant_id}/oauth2/v2.0/token`;

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.client_id,
        client_secret: config.client_secret,
        scope: '2ff814a6-3304-4ab8-85cb-cd0e6f879c1d/.default', // Databricks scope
      }),
    );

    return response.data.access_token;
  }
}

