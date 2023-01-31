<template>
  <cw-page-container>
    <template #header>
      <cw-navbar v-slot="{ activeItem }" :items="items" :bottom="isMobileView">
        <cw-profile-menu
          v-if="isMobileView"
          :active="!activeItem"
          :items="[...sidebarItems, ...dropdownItems]"
        />

        <cw-dropdown-profile
          v-else
          :active="!activeItem"
          :items="dropdownItems"
        />
      </cw-navbar>
    </template>

    <cw-sidebar v-if="!isMobileView" :items="sidebarItems" />

    <Nuxt />

    <cw-example-modal ref="exampleModal" />
  </cw-page-container>
</template>

<script>
export default {
  middleware: ['auth'],
  data () {
    return {
      items: [
        {
          icon: 'home',
          label: 'nav.home',
          to: '/home'
        },
        {
          icon: 'messages',
          label: 'nav.messages',
          to: '/chat'
        },
        {
          icon: 'calendar',
          label: 'nav.calendar',
          to: '/calendar'
        },
        {
          icon: 'cart',
          label: 'nav.cart',
          to: '/cart'
        },
        {
          icon: 'info-circle',
          label: 'nav.give_info',
          // to: '/info'
          click: () => this.$refs.exampleModal.show(),
          activePaths: ['/profile', '/qr-code']
        }
      ],

      dropdownItems: [
        {
          icon: 'person',
          label: 'nav.profile',
          to: `/chat/${this.$auth?.user?._id}/business`
        },
        {
          icon: 'exit',
          label: 'nav.logout',
          click: () => {
            this.$repos.authRepo.logout()
            this.$auth.logout()
          }
        }
      ],

      sidebarItems: [
        {
          label: 'nav.gym',
          icon: 'gym',
          to: '/gym',
          permission: 'gym.read'
        },
        {
          label: 'global.prospect',
          icon: 'prospect',
          to: '/prospect'
        },
        {
          label: 'nav.payments',
          icon: 'dollar-look'
        },
        {
          label: 'nav.calendar',
          icon: 'course',
          matched: '/calendar',
          to: '/calendar',
          submenu: [
            {
              label: 'nav.course_plan',
              to: '/calendar/planning'
            },
            {
              label: 'global.settings',
              to: '/calendar/settings'
            },
            {
              label: 'nav.assets',
              to: '/calendar/assets'
            },
            {
              label: 'nav.activities',
              to: '/calendar/activities'
            }
          ]
        },
        {
          label: 'nav.subscriptions',
          icon: 'dollar-circle',
          matched: '/subscriptions',
          submenu: [
            {
              label: 'nav.status',
              to: '/subscriptions/status'
            }
          ]
        },
        {
          label: 'nav.products',
          icon: 'product',
          matched: '/products',
          to: '/products',
          submenu: [
            {
              label: 'nav.status',
              to: '/products/status'
            },
            {
              label: 'nav.inventory',
              to: '/products/status'
            },
            {
              label: 'nav.categories',
              to: '/products/categories'
            },
            {
              label: 'nav.measures',
              to: '/products/measure'
            },
            {
              label: 'nav.colors_flavors',
              to: '/products/color'
            },
            {
              label: 'nav.product_templates',
              to: '/products/templates'
            }
          ]
        },
        {
          label: 'nav.promotions',
          icon: 'coupon',
          matched: '/promotions',
          to: '/promotions',
          submenu: [
            {
              label: 'nav.status',
              to: '/promotions/status'
            }
          ]
        },
        {
          label: 'nav.training_plans',
          icon: 'clock',
          matched: '/training',
          submenu: [
            {
              label: 'nav.status',
              to: '/training/status'
            }
          ]
        },
        {
          label: 'nav.report',
          icon: 'report',
          to: '/reports',
          matched: '/reports',
          permission: 'report.read',
          submenu: [
            {
              label: 'nav.contacts',
              to: '/reports/contacts',
              permission: 'report.contact.read'
            },
            {
              label: 'nav.orders',
              to: '/reports/orders'
            },
            {
              label: 'nav.sales',
              to: '/reports/sales'
            },
            {
              label: 'nav.earnings',
              to: '/reports/earnings'
            },
            {
              label: 'nav.other',
              to: '/reports/other'
            }
          ]
        },
        {
          label: 'nav.crm',
          icon: 'slash'
        },
        {
          label: 'nav.accounting',
          icon: 'coins'
        },
        {
          label: 'nav.payroll',
          icon: 'payroll'
        },
        {
          label: 'nav.cw_defaults',
          icon: 'settings',
          to: '/settings',
          matched: '/settings',
          permission: 'settings.read',
          submenu: [
            {
              label: 'nav.background',
              to: '/settings/background',
              permission: 'settings.background'
            },
            {
              label: 'nav.background_adv',
              to: '/settings/background-adv'
            },
            {
              label: 'nav.system_messages',
              to: '/settings/system-messages'
            },
            {
              label: 'global.languages',
              to: '/settings/languages',
              permission: 'settings.languages'
            },
            {
              label: 'nav.sport_interest',
              to: '/settings/sport-interest',
              permission: 'settings.sportInterest'
            },
            {
              label: 'nav.terms_of_payment',
              to: '/settings/terms-of-payment',
              permission: 'settings.termsOfPayment'
            },
            {
              label: 'nav.countries',
              to: '/settings/countries',
              permission: 'settings.countries'
            },
            {
              label: 'nav.surveys',
              to: '/settings/surveys'
            }
          ]
        }
      ]
    }
  },
  computed: {
    isMobileView () {
      return ['mobile'].includes(this.$mq)
    }
  }
}
</script>
