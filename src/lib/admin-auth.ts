import 'server-only';

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const ADMIN_ROLES = ['owner', 'manager', 'accountant'] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
}

function splitEnvList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminRole(value: unknown): value is AdminRole {
  return typeof value === 'string' && ADMIN_ROLES.includes(value as AdminRole);
}

function roleFromUsername(username: string): AdminRole | null {
  const normalized = username.toLowerCase();
  const usernameRoles: Array<[AdminRole, string[]]> = [
    ['owner', splitEnvList(process.env.ADMIN_OWNER_USERNAMES)],
    ['manager', splitEnvList(process.env.ADMIN_MANAGER_USERNAMES)],
    ['accountant', splitEnvList(process.env.ADMIN_ACCOUNTANT_USERNAMES)],
  ];

  return usernameRoles.find(([, usernames]) => usernames.includes(normalized))?.[0] ?? null;
}

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  const user = await currentUser();
  if (!user?.username) return null;

  const metadataRole = user.publicMetadata.role ?? user.privateMetadata.role;
  const role = roleFromUsername(user.username) ?? (isAdminRole(metadataRole) ? metadataRole : null);
  if (!role) return null;

  return {
    id: user.id,
    username: user.username,
    displayName: user.fullName ?? user.username,
    role,
  };
}

export async function requireAdminUser(): Promise<AdminUser> {
  const adminUser = await getCurrentAdminUser();
  if (!adminUser) redirect('/admin/unauthorized');
  return adminUser;
}
