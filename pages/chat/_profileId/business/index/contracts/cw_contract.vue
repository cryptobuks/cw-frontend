<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: `flex flex-col h-full ${!loading ? 'bg-white p-4' : ''}`,
      hideSearch: false,
      showSearchToggler: true,
      title: $t(`contract.type.cw_contract`)
    }"
    v-on="$listeners"
    @search="keywords = $event"
  >
    <nuxt-child
      v-bind="{
        ...$attrs,
        modules,
        profile,
        previousPage: `${$attrs.previousPage}/cw_contract`
      }"
    />
    <base-card-loading v-if="loading" />
    <div v-else class="flex flex-col space-y-4">
      <base-swipe-card
        v-for="modul in filteredModules"
        :key="`cw-contract-${modul.name}`"
        auto-height
        bg-color="white"
        container-class="text-black"
        class="shadow-cw-card"
        :actions="[{ icon: 'eye' }]"
        toggler-class="text-black"
        @opened="$router.push(`${$route.path}/${modul.active._id}`)"
      >
        <cw-price-item
          #default="{ open }"
          v-bind="{ modul, nested: true, price: modul.active, profile }"
        >
          <div v-if="open" class="flex flex-col space-y-2">
            <base-swipe-card
              v-for="exPrice in modul.data"
              :key="`contract-ex-prices-${exPrice._id}`"
              auto-height
              bg-color="#2d2d2d"
              container-class="text-white"
              :actions="[{ icon: 'eye' }]"
              toggler-class="text-white"
              @opened="$router.push(`${$route.path}/${modul.active._id}`)"
            >
              <cw-price-item v-bind="{ modul, price: exPrice, profile }" />
            </base-swipe-card>
          </div>
        </cw-price-item>
      </base-swipe-card>
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
    keywords: '',
    modules: [],
    loading: true
  }),
  computed: {
    filteredModules () {
      return this.modules.filter(modul =>
        modul.label.toLowerCase().match(this.keywords.toLowerCase())
      )
    }
  },
  watch: {
    profile: {
      immediate: true,
      deep: true,
      handler () {
        this.getModules()
      }
    }
  },
  methods: {
    async getModules (loading = true) {
      this.loading = loading
      const [areas, modules] = await Promise.all([
        this.$repos.contractsRepo.getGymPriceList(this.profile),
        this.$repos.contractsRepo.getGymModules(this.profile._id)
      ])
      this.modules = areas.map(area => ({
        ...area,
        ...modules.find(m => m.modules.area === area.name),
        data: area.data.filter(p => p.status !== 'active'),
        active: area.data.find(p => p.status === 'active')
      }))
      this.loading = false
    }
  }
}
</script>

<style></style>
