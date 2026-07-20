<template>
  <v-app-bar :elevation="0" color="surface" class="app-navbar border-b">
    <v-container fluid class="d-flex align-center px-6">
      <router-link to="/" class="logo-link">
        <v-avatar class="logo-avatar">
          <img src="../assets/images/logo.png" alt="BeetHealth Logo" />
        </v-avatar>
      </router-link>

      <v-spacer></v-spacer>

      <nav class="nav-items d-none d-md-flex align-center">
        <a
          v-for="item in visibleNavigationItems"
          :key="item.path"
          :ripple="false"
          class="nav-btn"
          variant="text"
          :class="{ active: isActiveRoute(item.path) }"
          @click="goTo(item.path)"
        >
          {{ item.title }}
        </a>
      </nav>

      <v-spacer></v-spacer>

      <div class="action-buttons d-flex align-center ga-2 profileWrap">
        <div class="icon-group d-flex align-center ga-2">
          <span icon variant="text" size="small" class="action-icon-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <path
                d="M6.84961 6.0752H22.1504C22.3566 6.0753 22.5542 6.15393 22.6992 6.29395C22.8442 6.43393 22.9247 6.62353 22.9248 6.82031V18.3076C22.9248 18.5044 22.8442 18.694 22.6992 18.834C22.5542 18.974 22.3566 19.0526 22.1504 19.0527H9.76172L9.74121 19.0684L6.0752 21.8486V6.82031C6.07525 6.62353 6.15577 6.43393 6.30078 6.29395C6.44584 6.15393 6.64339 6.0753 6.84961 6.0752ZM7.625 18.7744L7.74512 18.6836L9.22363 17.5625H21.375V7.56641H7.625V18.7744ZM18.6748 11.8184V13.3096H17.125V11.8184H18.6748ZM15.2754 11.8184V13.3096H13.7246V11.8184H15.2754ZM11.875 11.8184V13.3096H10.3252V11.8184H11.875Z"
                fill="#A65898"
                stroke="#FCE8F9"
                stroke-width="0.15"
              />
            </svg>
          </span>

          <span icon variant="text" size="small" class="action-icon-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
            >
              <path
                d="M22.1626 19.9978H5.61719V18.3433H6.44446V12.578C6.44446 8.4516 9.77837 5.10693 13.8899 5.10693C18.0015 5.10693 21.3354 8.4516 21.3354 12.578V18.3433H22.1626V19.9978ZM8.09901 18.3433H19.6808V12.578C19.6808 9.36573 17.0882 6.76148 13.8899 6.76148C10.6917 6.76148 8.09901 9.36573 8.09901 12.578V18.3433ZM11.8217 20.8251H15.9581C15.9581 21.3736 15.7402 21.8997 15.3523 22.2875C14.9645 22.6754 14.4384 22.8933 13.8899 22.8933C13.3414 22.8933 12.8153 22.6754 12.4275 22.2875C12.0396 21.8997 11.8217 21.3736 11.8217 20.8251Z"
                fill="#A65898"
              />
            </svg>
          </span>

          <v-menu location="bottom end" offset="10">
            <template #activator="{ props }">
              <span v-bind="props" icon variant="text" size="small" class="action-icon-btn">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                >
                  <path
                    d="M21 22H19.375V20.381C19.375 19.7369 19.1182 19.1191 18.6611 18.6637C18.204 18.2082 17.584 17.9524 16.9375 17.9524H12.0625C11.416 17.9524 10.796 18.2082 10.3389 18.6637C9.88181 19.1191 9.625 19.7369 9.625 20.381V22H8V20.381C8 19.3075 8.42801 18.2779 9.18988 17.5189C9.95175 16.7598 10.9851 16.3333 12.0625 16.3333H16.9375C18.0149 16.3333 19.0483 16.7598 19.8101 17.5189C20.572 18.2779 21 19.3075 21 20.381V22ZM14.5 14.7143C13.8598 14.7143 13.2259 14.5887 12.6344 14.3446C12.043 14.1005 11.5055 13.7427 11.0529 13.2917C10.6002 12.8406 10.2411 12.3052 9.99609 11.7159C9.7511 11.1266 9.625 10.495 9.625 9.85714C9.625 9.21929 9.7511 8.58769 9.99609 7.99839C10.2411 7.4091 10.6002 6.87365 11.0529 6.42262C11.5055 5.9716 12.043 5.61382 12.6344 5.36973C13.2259 5.12563 13.8598 5 14.5 5C15.7929 5 17.0329 5.51173 17.9471 6.42262C18.8614 7.33352 19.375 8.56895 19.375 9.85714C19.375 11.1453 18.8614 12.3808 17.9471 13.2917C17.0329 14.2026 15.7929 14.7143 14.5 14.7143ZM14.5 13.0952C15.362 13.0952 16.1886 12.7541 16.7981 12.1468C17.4076 11.5396 17.75 10.7159 17.75 9.85714C17.75 8.99835 17.4076 8.17472 16.7981 7.56746C16.1886 6.9602 15.362 6.61905 14.5 6.61905C13.638 6.61905 12.8114 6.9602 12.2019 7.56746C11.5924 8.17472 11.25 8.99835 11.25 9.85714C11.25 10.7159 11.5924 11.5396 12.2019 12.1468C12.8114 12.7541 13.638 13.0952 14.5 13.0952Z"
                    fill="#A65898"
                  />
                </svg>
              </span>
            </template>

            <v-list density="comfortable" min-width="180">
              <v-list-item
                :title="authStore.user?.name || 'User'"
                :subtitle="authStore.user?.roleName || ''"
              />
              <v-divider class="my-1" />
              <v-list-item title="Logout" prepend-icon="mdi-logout" @click="handleLogout" />
            </v-list>
          </v-menu>
        </div>

        <v-btn
          icon
          variant="text"
          size="small"
          class="d-md-none action-icon-btn"
          @click="drawer = !drawer"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </div>
    </v-container>
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="right" class="mobile-drawer">
    <v-list density="comfortable" nav>
      <v-list-item
        v-for="item in visibleNavigationItems"
        :key="item.path"
        :title="item.title"
        :prepend-icon="item.icon"
        :active="isActiveRoute(item.path)"
        @click="handleMobileNav(item.path)"
      ></v-list-item>

      <v-divider class="my-3" />
      <v-list-item title="Logout" prepend-icon="mdi-logout" @click="handleLogout" />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { PERMISSIONS } from '@/constants/permissions'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const drawer = ref(false)

function goTo(path) {
  if (isActiveRoute(path)) return
  router.push(path)
}

function handleMobileNav(path) {
  goTo(path)
  drawer.value = false
}

async function handleLogout() {
  await authStore.logout()
  drawer.value = false
  router.push('/login')
}

const navigationItems = [
  {
    title: 'Home',
    path: '/',
    icon: 'mdi-home',
  },
  {
    title: 'Clients',
    path: '/clients',
    icon: 'mdi-account-group',
    permission: PERMISSIONS.CLIENTS_READ,
  },
  {
    title: 'Clinics',
    path: '/super-admin/overview',
    icon: 'mdi-hospital-building',
    permission: PERMISSIONS.CLINICS_READ,
  },
  // {
  //   title: 'Clinics',
  //   path: '/clinic-owner/overview',
  //   icon: 'mdi-hospital-building',
  //   permission: PERMISSIONS.CLINICS_READ,
  // },
  {
    title: 'Templates',
    path: '/templates',
    icon: 'mdi-file-document-multiple',
    permission: PERMISSIONS.TEMPLATES_READ,
  },
  {
    title: 'Recipes',
    path: '/recipes',
    icon: 'mdi-food-apple',
    permission: PERMISSIONS.RECIPES_READ,
  },
  {
    title: 'Messages',
    path: '/messages',
    icon: 'mdi-message-text',
  },
  {
    title: 'Payments',
    path: '/payments',
    icon: 'mdi-credit-card',
  },
  {
    title: 'Schedule',
    path: '/schedule',
    icon: 'mdi-calendar-month',
  },
]

const visibleNavigationItems = computed(() => {
  return navigationItems.filter((item) => {
    if (!item.permission) return true
    return authStore.can(item.permission)
  })
})

const isActiveRoute = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  if (path === '/clients') {
    return route.path === '/clients' || route.path.startsWith('/client/')
  }
  if (path === '/super-admin/clinics') {
    return route.path.startsWith('/super-admin/')
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
.app-navbar {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.logo-link {
  text-decoration: none;
  display: flex;
  align-items: center;
}

.logo-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.logo-avatar:hover {
  transform: scale(1.05);
}

.nav-items {
  gap: 4px;
}

.nav-btn {
  text-transform: none;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0;
  color: rgb(71, 85, 105);
  border-radius: 20px;
  padding: 8px 20px;
  min-width: auto;
  height: 40px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  color: rgb(71, 85, 105);
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background-color: rgba(124, 58, 237, 0.08);
  color: rgb(124, 58, 237);
}

.mobile-drawer {
  padding-top: 16px;
}

.icon-group {
  flex-wrap: nowrap;
}
</style>
