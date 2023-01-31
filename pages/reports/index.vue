<template>
  <base-main-card
    v-slot="{ items }"
    :title="$t('nav.report')"
    :items="menus"
    :item-text="(item) => $t(item.title)"
  >
    <base-card-list-container :items="items">
      <template #item="{ item: menu }">
        <base-swipe-card hide-actions bg-color="gray">
          <template #title>
            <nuxt-link :to="menu.to" class="block text-white hover:text-white">
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
    permission: 'report.read'
  },
  data () {
    return {
      menus: [
        {
          title: 'nav.contacts',
          to: '/reports/contacts'
        },
        {
          title: 'nav.orders',
          to: '/reports/orders'
        },
        {
          title: 'nav.sales',
          to: '/reports/sales'
        },
        {
          title: 'nav.earnings',
          to: '/reports/earnings'
        },
        {
          title: 'nav.other',
          to: '/reports/terms-of-payment'
        }
      ]
    }
  }
}
</script>
