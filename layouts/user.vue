<template>
  <cw-page-container
    bg-image="/images/sample/bg-user.jpeg"
    body-class="px-0 py-0"
  >
    <template #header>
      <cw-navbar
        v-slot="{ activeItem }"
        :items="isMobileView ? mobileItems : items"
        :bottom="isMobileView"
      >
        <cw-profile-menu
          v-if="isMobileView"
          :items="dropdownItems"
          :active="!activeItem"
        />

        <cw-dropdown-profile
          v-else
          :active="!activeItem"
          :items="dropdownItems"
        />
      </cw-navbar>
    </template>

    <Nuxt />
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
          to: '/chat',
          activePaths: [
            '/profile',
            '/qr-code'
          ]

        },
        {
          icon: 'calendar',
          label: 'nav.calendar',
          to: '/calendar'
        },
        {
          icon: 'shopping',
          label: 'nav.shop',
          to: '/shop'
        }
      ],

      mobileItems: [
        {
          icon: 'home',
          label: 'nav.home',
          to: '/home'
        },
        {
          icon: 'messages',
          label: 'nav.messages',
          to: '/chat',
          activePaths: [
            '/profile',
            '/qr-code'
          ]
        },
        {
          icon: 'calendar',
          label: 'nav.calendar',
          to: '/calendar'
        },
        {
          icon: 'shopping',
          label: 'nav.shop',
          to: '/shop'
        }
      ],

      dropdownItems: [
        {
          icon: 'qr-code',
          label: 'nav.membership_card',
          to: `/chat/${this.$auth?.user?._id}/user/qr-code`
        },
        {
          icon: 'person',
          label: 'nav.profile',
          to: `/chat/${this.$auth?.user?._id}/user`
        },
        {
          icon: 'performance',
          label: 'profile.entities.performance',
          to: `/chat/${this.$auth?.user?._id}/user/performance`
        },
        {
          icon: 'settings',
          label: 'global.settings',
          to: `/chat/${this.$auth?.user?._id}/user/settings`
        },
        {
          icon: 'exit',
          label: 'nav.logout',
          click: () => {
            this.$repos.authRepo.logout()
            this.$auth.logout()
          }
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
