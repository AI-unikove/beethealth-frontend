import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

// Pages
import HomePage from '@/pages/HomePage.vue'
import ClientsPage from '@/pages/ClientsPage.vue'
import ClientProfile from '@/pages/ClientProfile.vue'
import TemplatesPage from '@/pages/TemplatesPage.vue'
import RecipesPage from '@/pages/RecipesPage.vue'
import AddRecipePage from '@/pages/recipe/AddRecipePage.vue'
import PaymentsPage from '@/pages/PaymentsPage.vue'
import SchedulePage from '@/pages/SchedulePage.vue'
import LoginPage from '@/pages/LoginPage.vue'

// Onboarding (Public - No Layout)
import TypeformContainer from '@/components/onboarding/TypeformContainer.vue'
import OnboardingComplete from '@/pages/OnboardingComplete.vue'
import CreateTemplate from '@/pages/CreateTemplate.vue'
import AddClientPage from '@/pages/AddClientPage.vue'
import {
  clearStoredSession,
  getStoredJson,
  getStoredValue,
  isJwtExpired,
} from '@/utils/authStorage'
import SuperAdminOverviewPage from '@/pages/superadmin/SuperAdminOverviewPage.vue'
import ClinicsManagementPage from '@/pages/superadmin/ClinicsManagementPage.vue'
import CreateClinicPage from '@/pages/superadmin/CreateClinicPage.vue'
import EditClinicPage from '@/pages/superadmin/EditClinicPage.vue'
import BranchDashboardPage from '@/pages/superadmin/BranchDashboardPage.vue'
import ClinicOwnerPage from '@/pages/clinicowner/ClinicOwnerPage.vue'
import ClinicOnboardingPage from '@/pages/clinicowner/ClinicOnboardingPage.vue'
import { hasPermission, PERMISSIONS } from '@/constants/permissions'

function getDefaultAuthenticatedRoute(currentUser) {
  if (currentUser?.roleName === 'super_admin') {
    return '/super-admin/overview'
  }

  if (currentUser?.roleName === 'clinic_owner') {
    return '/clinic-owner/overview'
  }

  return '/'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public Routes - Onboarding (No Auth Required)
    {
      path: '/onboarding',
      name: 'onboarding',
      component: TypeformContainer,
      meta: { requiresAuth: false },
    },
    {
      path: '/onboarding-complete',
      name: 'onboarding-complete',
      component: OnboardingComplete,
      meta: { requiresAuth: false },
    },
    // Auth Routes
    {
      path: '/login',
      component: AuthLayout,
      children: [
        {
          path: '',
          name: 'login',
          component: LoginPage,
          meta: { requiresAuth: false },
        },
      ],
    },
    {
      path: '/',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: HomePage,
        },
        {
          path: 'clients',
          name: 'clients',
          component: ClientsPage,
          meta: { permission: PERMISSIONS.CLIENTS_READ },
        },
        {
          path: 'add-client',
          name: 'add-client',
          component: AddClientPage,
          meta: { permission: PERMISSIONS.CLIENTS_WRITE },
        },
        {
          path: 'client/:id',
          name: 'client-profile',
          component: ClientProfile,
          meta: { permission: PERMISSIONS.CLIENTS_READ },
        },
        {
          path: 'templates',
          name: 'templates',
          component: TemplatesPage,
          meta: { permission: PERMISSIONS.TEMPLATES_READ },
        },
        {
          path: 'create-template',
          name: 'create-template',
          component: CreateTemplate,
          meta: { permission: PERMISSIONS.TEMPLATES_WRITE },
        },
        {
          path: 'template/:id',
          name: 'template-detail',
          component: CreateTemplate,
          meta: { permission: PERMISSIONS.TEMPLATES_READ },
        },
        {
          path: 'recipes',
          name: 'recipes',
          component: RecipesPage,
          meta: { permission: PERMISSIONS.RECIPES_READ },
        },
        {
          path: 'recipes/add-new-recipe',
          name: 'add-recipe',
          component: AddRecipePage,
          meta: { permission: PERMISSIONS.RECIPES_WRITE },
        },
        {
          path: 'payments',
          name: 'payments',
          component: PaymentsPage,
        },
        {
          path: 'schedule',
          name: 'schedule',
          component: SchedulePage,
        },
        {
          path: 'super-admin/overview',
          name: 'super-admin-overview',
          component: SuperAdminOverviewPage,
          meta: { permission: PERMISSIONS.CLINICS_READ },
        },
        {
          path: 'super-admin/clinics',
          name: 'super-admin-clinics',
          component: ClinicsManagementPage,
          meta: { permission: PERMISSIONS.CLINICS_READ },
        },
        {
          path: 'super-admin/clinics/create',
          name: 'super-admin-create-clinic',
          component: CreateClinicPage,
          meta: { permission: PERMISSIONS.CLINICS_WRITE },
        },
        {
          path: 'super-admin/clinics/:id/edit',
          name: 'super-admin-edit-clinic',
          component: EditClinicPage,
          meta: { permission: PERMISSIONS.CLINICS_WRITE },
        },
        {
          path: 'super-admin/clinics/:clinicId/branches/:branchId',
          name: 'branch-dashboard',
          component: BranchDashboardPage,
          meta: { permission: PERMISSIONS.CLINICS_READ },
        },
        {
          path: 'clinic-owner/overview',
          name: 'clinic-owner-overview',
          component: ClinicOwnerPage,
          meta: { permission: PERMISSIONS.CLINICS_WRITE },
        },
        {
          path: 'clinic-owner/onboarding',
          name: 'clinic-owner-onboarding',
          component: ClinicOnboardingPage,
          meta: { permission: PERMISSIONS.CLINICS_WRITE },
        },
        {
          path: 'clinic-owner/branches/:branchId',
          name: 'clinic-owner-branch',
          component: BranchDashboardPage,
        },
      ],
    },
  ],
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const token = getStoredValue('bh_access_token', '')
  const hasExpiredToken = Boolean(token) && isJwtExpired(token, 5)
  if (hasExpiredToken) {
    clearStoredSession()
  }
  const permissions = getStoredJson('bh_permissions', [])
  const currentUser = getStoredJson('bh_user', null)
  const isAuthenticated = Boolean(token) && !hasExpiredToken
  const requiredPermission = to.meta?.permission
  const defaultAuthenticatedRoute = getDefaultAuthenticatedRoute(currentUser)

  if (isAuthenticated && to.name === 'home' && defaultAuthenticatedRoute !== '/') {
    next(defaultAuthenticatedRoute)
    return
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (
    to.meta.requiresAuth &&
    requiredPermission &&
    !hasPermission(permissions, requiredPermission)
  ) {
    next('/')
  } else if (to.path === '/login' && isAuthenticated) {
    next(defaultAuthenticatedRoute)
  } else {
    next()
  }
})

export default router
