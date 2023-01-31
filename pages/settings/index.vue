<template>
  <base-main-card
    v-slot="{ items }"
    :title="$t('nav.cw_defaults')"
    :items="menus"
    :item-text="item => $t(item.title)"
  >
    <base-card-list-container :items="items">
      <template #item="{ item: menu }">
        <base-swipe-card hide-actions>
          <template #title>
            <nuxt-link
              :to="menu.to"
              class="block text-white hover:text-white"
            >
              {{ $t(menu.title) }}
            </nuxt-link>
          </template>

          <template #footer>
            <div class="inline-flex ml-auto">
              <base-icon name="person" size="20" class="mr-1" /> 10.001
            </div>
          </template>
        </base-swipe-card>
      </template>
    </base-card-list-container>
  </base-main-card>
</template>

<script>
export default {
  meta: {
    permission: 'settings.read'
  },
  data () {
    return {
      menus: [
        {
          title: 'nav.background',
          to: '/settings/background'
        },
        {
          title: 'nav.system_messages',
          to: '/settings/system-messages'
        },
        {
          title: 'global.languages',
          to: '/settings/languages'
        },
        {
          title: 'nav.sport_interest',
          to: '/settings/sport-interest'
        },
        {
          title: 'nav.terms_of_payment',
          to: '/settings/terms-of-payment'
        },
        {
          title: 'nav.countries',
          to: '/settings/countries'
        },
        {
          title: 'nav.surveys',
          to: '/settings/surveys'
        }
      ]
    }
  }
}
</script>
