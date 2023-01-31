<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      hideSearch: false,
      showSearchToggler: true,
      title: $t('profile.entities.accesses'),
      bodyClass: 'flex flex-col px-4 py-4 h-profile-body bg-white'
    }"
    v-on="$listeners"
  >
    <div class="flex flex-col space-y-4">
      <div
        v-for="access in accessLog"
        :key="access.title"
        class="shadow-cw-card rounded-lg w-full flex items-center p-4 text-left"
      >
        <img
          :src="access.avatar"
          :alt="access.title"
          class="h-12 w-12 rounded-full"
        >
        <div class="flex flex-col justify-between ml-3">
          <div class="flex flex-col items-start focus:outline-none">
            <nuxt-link
              :to="`${$route.path}/${access._id}`"
              class="text-sm font-bold focus:outline-none"
            >
              {{ access.title }}
            </nuxt-link>
            <span class="text-gray-500 text-xs">{{ access.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </base-main-card>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data: () => ({
    accesses: [
      {
        title: 'Business Profile %room name%',
        date: '01..02.2021',
        avatar: '/images/sample/profile-man.jpg'
      },
      {
        title: 'Business Profile',
        date: '01..02.2021',
        avatar: '/images/sample/profile-man.jpg'
      }
    ],
    accessLog: [],
    pagination: { fromRecord: 1, totalRecord: 10 },
    loading: true
  }),
  watch: {
    profile: {
      immediate: true,
      deep: true,
      handler () {
        this.getAccessLog()
      }
    }
  },
  methods: {
    async getAccessLog (loading = true, fetchMore = false) {
      if (!this.profile) { return }
      this.loading = loading
      if (fetchMore) { this.pagination.fromRecord += this.pagination.totalRecord }

      this.accessLog = await this.$repos.profileRepo.access
        .getAccessLog({
          ...this.pagination,
          profileId: this.profile._id,
          fromDate: this.$dayjs().format('YYYYMMDD'),
          toDate: this.$dayjs().subtract(30, 'day').format('YYYYMMDD')
        })
        .then(data => data.logs)
    }
  }
}
</script>
