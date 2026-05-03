import { getGraphQLService } from './graphqlService';
import { getRestApiService } from '../restApiService/restApiService';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalDossiers: number;
  pendingDossiers: number;
  validatedDossiers: number;
  rejectedDossiers: number;
  openSupportTickets: number;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  profilePicture?: string;
}

export interface AdminUserList {
  users: AdminUser[];
  total: number;
}

export interface AuditLogEntry {
  id: string;
  eventType: string;
  severity: string;
  userId?: string;
  targetUserId?: string;
  ipAddress?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  user?: { firstName: string; lastName: string; email: string };
}

export interface AuditLogList {
  logs: AuditLogEntry[];
  total: number;
}

export interface AdminDossier {
  id: string;
  status: string;
  clientId: string;
  propertyId?: string;
  notaryId?: string;
  assignedAdminId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  userId: string;
  assignedAdminId?: string;
  createdAt: string;
  updatedAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

// ─── GraphQL Queries / Mutations ─────────────────────────────────────────────

const DASHBOARD_QUERY = `
  query AdminDashboard {
    adminDashboard {
      totalUsers activeUsers suspendedUsers
      totalDossiers pendingDossiers validatedDossiers rejectedDossiers
      openSupportTickets
    }
  }
`;

const ALL_USERS_QUERY = `
  query AdminAllUsers($page: Int, $limit: Int, $role: String, $isActive: Boolean, $search: String) {
    adminAllUsers(page: $page, limit: $limit, role: $role, isActive: $isActive, search: $search) {
      total
      users {
        id userId firstName lastName email role isActive createdAt profilePicture avatar
      }
    }
  }
`;

const AUDIT_LOGS_QUERY = `
  query AdminActionHistory($page: Int, $limit: Int, $eventType: String, $userId: String, $severity: String) {
    adminActionHistory(page: $page, limit: $limit, eventType: $eventType, userId: $userId, severity: $severity) {
      total
      logs {
        id eventType severity ipAddress timestamp
        userId targetUserId
        user { firstName lastName email }
      }
    }
  }
`;

const SUSPEND_USER_MUTATION = `
  mutation AdminSuspendUser($userId: ID!, $reason: String!) {
    adminSuspendUser(userId: $userId, reason: $reason) {
      id isActive
    }
  }
`;

const ACTIVATE_USER_MUTATION = `
  mutation AdminActivateUser($userId: ID!) {
    adminActivateUser(userId: $userId) {
      id isActive
    }
  }
`;

const DELETE_USER_MUTATION = `
  mutation AdminDeleteUser($userId: ID!) {
    adminDeleteUser(userId: $userId)
  }
`;

// ─── Service ──────────────────────────────────────────────────────────────────

class AdminService {
  private static instance: AdminService;

  static getInstance(): AdminService {
    if (!AdminService.instance) AdminService.instance = new AdminService();
    return AdminService.instance;
  }

  private get gql() { return getGraphQLService(); }
  private get rest() { return getRestApiService(); }

  // Dashboard
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const data = await this.gql.query<{ adminDashboard: AdminDashboardStats }>(DASHBOARD_QUERY);
    return data.adminDashboard;
  }

  // Users
  async getAllUsers(params: { page?: number; limit?: number; role?: string; isActive?: boolean; search?: string } = {}): Promise<AdminUserList> {
    const data = await this.gql.query<{ adminAllUsers: AdminUserList }>(ALL_USERS_QUERY, { page: params.page ?? 1, limit: params.limit ?? 20, ...params });
    return data.adminAllUsers;
  }

  async suspendUser(userId: string, reason: string): Promise<void> {
    await this.gql.mutate(SUSPEND_USER_MUTATION, { userId, reason });
  }

  async activateUser(userId: string): Promise<void> {
    await this.gql.mutate(ACTIVATE_USER_MUTATION, { userId });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.gql.mutate(DELETE_USER_MUTATION, { userId });
  }

  // Audit logs
  async getAuditLogs(params: { page?: number; limit?: number; eventType?: string; userId?: string; severity?: string } = {}): Promise<AuditLogList> {
    const data = await this.gql.query<{ adminActionHistory: AuditLogList }>(AUDIT_LOGS_QUERY, { page: params.page ?? 1, limit: params.limit ?? 30, ...params });
    return data.adminActionHistory;
  }

  // Dossiers — REST (no GraphQL resolver for admin dossier list)
  async getDossiers(params: { page?: number; limit?: number; status?: string } = {}): Promise<{ dossiers: AdminDossier[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    const res = await this.rest.get<any>(`/dossiers?${query.toString()}`);
    return { dossiers: res.dossiers ?? res.data ?? res ?? [], total: res.total ?? 0 };
  }

  async validateDossier(dossierId: string): Promise<void> {
    await this.rest.put(`/dossiers/${dossierId}/validate`, {});
  }

  async rejectDossier(dossierId: string, reason: string): Promise<void> {
    await this.rest.put(`/dossiers/${dossierId}/reject`, { reason });
  }

  async assignNotary(dossierId: string, notaryId: string): Promise<void> {
    await this.rest.put(`/dossiers/${dossierId}/assign-notary`, { notaryId });
  }

  // Support tickets — REST
  async getAllTickets(params: { page?: number; limit?: number; status?: string } = {}): Promise<{ tickets: AdminTicket[]; total: number }> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.status) query.set('status', params.status);
    const res = await this.rest.get<any>(`/support/tickets/all?${query.toString()}`);
    return { tickets: res.tickets ?? res.data ?? res ?? [], total: res.total ?? 0 };
  }

  async assignTicket(ticketId: string, adminId: string): Promise<void> {
    await this.rest.put(`/support/tickets/${ticketId}/assign`, { adminId });
  }

  async closeTicket(ticketId: string): Promise<void> {
    await this.rest.put(`/support/tickets/${ticketId}/close`, {});
  }
}

export const getAdminService = () => AdminService.getInstance();
