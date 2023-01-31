<template>
  <base-main-card
    v-slot="{ items }"
    :title="$t('nav.contacts')"
    :items="menus"
    show-back-button
    previous-page="/reports"
    :item-text="(item) => $t(item.title)"
  >
    <base-card-list-container :items="items">
      <template #item="{ item: menu }">
        <div class="relative">
          <button
            class="absolute top-0 left-0 w-5 h-full rounded-l-10px z-10"
            :class="[menu.color]"
            @click="$emit('filter-course')"
          />
          <base-swipe-card hide-actions bg-color="gray" class="ml-2">
            <template #title>
              <nuxt-link :to="menu.to">
                <span class="text-xs ml-2">{{ $t(menu.title) }}</span>
              </nuxt-link>
            </template>

            <template #default>
              <template v-for="(item, key, index) in menu.data">
                <div
                  v-if="!Array.isArray(menu.data) && menu.data"
                  :key="index"
                  class="text-sm ml-2"
                >
                  {{ item }} -
                  <span class="capitalize">{{ key }}</span>
                </div>
                <div
                  v-if="Array.isArray(menu.data) && menu.data"
                  :key="index"
                  class="text-sm ml-2"
                >
                  {{ item.channel }} -
                  <span class="capitalize">{{ item.count }}</span>
                </div>
              </template>
            </template>
            <template #footer>
              <span class="text-sm jinline-flex ml-auto">{{ menu.date }}</span>
            </template>
          </base-swipe-card>
        </div>
      </template>
    </base-card-list-container>
  </base-main-card>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  meta: {
    permission: 'report.contact.read'
  },
  data () {
    return {
      stats: []
    }
  },
  computed: {
    ...mapGetters({
      getSport: 'settings/getSport'
    }),
    menus () {
      return [
        {
          title: 'report.contact',
          to: '/reports/contacts/profile',
          color: 'bg-green',
          data: this.stats.contacts,
          date: this.$dayjs().format('DD/MM/YYYY')
        },
        {
          title: 'report.contact_by_sport',
          to: '/reports/contacts/sport',
          color: 'bg-orange',
          date: this.$dayjs().format('DD/MM/YYYY'),
          data: this.stats.channels
        },
        {
          title: 'report.contact_by_channel',
          to: '/reports/contacts/channel',
          color: 'bg-blue',
          date: 'Last 30 days'
        },
        {
          title: 'report.accesses',
          to: '/reports/contacts/access',
          color: 'bg-yellow-500',
          date: 'Last 30 days'
        }
      ]
    }
  },
  async mounted () {
    await this.getStats()
  },
  methods: {
    ...mapActions({
      getSportInterests: 'settings/getSportInterests'
    }),
    async getStats () {
      await this.getSportInterests()
      this.stats = await this.$repos.statRepo.cardStats()
    }
  }
}
</script>
