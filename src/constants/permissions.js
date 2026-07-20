export const PERMISSIONS = {
  // Clinic Permissions
  CLINICS_READ: 'clinics:read',
  CLINICS_WRITE: 'clinics:write',
  CLINIC_CONFIG_WRITE: 'clinic-config:write',

  // Branch Permissions
  BRANCHES_READ: 'branches:read',
  BRANCHES_WRITE: 'branches:write',

  // Employee/Staff Permissions
  EMPLOYEES_READ: 'employees:read',
  EMPLOYEES_WRITE: 'employees:write',
  PERMISSIONS_MANAGE: 'permissions:manage',

  // Client Permissions
  CLIENTS_READ: 'clients:read',
  CLIENTS_WRITE: 'clients:write',
  CLIENT_HEALTH_READ: 'client-health:read',
  CLIENT_HEALTH_WRITE: 'client-health:write',

  // Diet Plan & Recipe Permissions
  TEMPLATES_READ: 'templates:read',
  TEMPLATES_WRITE: 'templates:write',
  RECIPES_READ: 'recipes:read',
  RECIPES_WRITE: 'recipes:write',

  // Meal Plan Permissions
  ASSIGNED_PLANS_READ: 'assigned-plans:read',
  ASSIGNED_PLANS_WRITE: 'assigned-plans:write',

  // Appointment/Scheduling Permissions
  APPOINTMENTS_READ: 'appointments:read',
  APPOINTMENTS_WRITE: 'appointments:write',
  AVAILABILITY_MANAGE: 'availability:manage',

  // Analytics & Finance Permissions
  ANALYTICS_READ: 'analytics:read',
  FINANCE_READ: 'finance:read',
  FINANCE_WRITE: 'finance:write',
  BILLING_READ: 'billing:read',
  BILLING_WRITE: 'billing:write',
  INVOICES_READ: 'invoices:read',
  INVOICES_WRITE: 'invoices:write',

  // OCR Permissions
  OCR_WRITE: 'ocr:write',

  // Enums/Settings Permissions
  ENUMS_READ: 'enums:read',
  ENUMS_WRITE: 'enums:write',

  // Super Admin Override
  ALL: '*',
}

export const ROLE_NAMES = {
  SUPER_ADMIN: 'super_admin',
  CLINIC_OWNER: 'clinic_owner',
  NUTRITIONIST: 'nutritionist',
  RECEPTIONIST: 'receptionist',
  CLIENT: 'client',
}

export function hasPermission(permissions = [], requiredPermission = '') {
  if (!requiredPermission) return true
  if (!Array.isArray(permissions)) return false
  return permissions.includes(PERMISSIONS.ALL) || permissions.includes(requiredPermission)
}
