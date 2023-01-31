<template>
  <base-input-autocomplete
    v-bind="$attrs"
    :debounce-duration="300"
    item-text="displayName"
    :items="suggestedCompanies"
    v-on="$listeners"
    @search="search"
    @item-select="onProfileSelected"
  >
    <template #item-text="{ item }">
      <span class="px-2 py-1">
        {{ [item.displayName, item.vat && item.vat.countryCode.toUpperCase() + item.vat.value].filter(Boolean).join(' – ') }}
      </span>
    </template>

    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="props">
      <slot :name="name" v-bind="props" />
    </template>
  </base-input-autocomplete>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    useSuggestions: Boolean,
    isGym: Boolean,
    hiddenSuggestionsId: { type: Array, default: () => [] },
    typeCodes: { type: Array, default: () => [] }
  },
  data () {
    return {
      suggestedCompanies: []
    }
  },
  methods: {
    async search (keyword) {
      if (this.useSuggestions && keyword && keyword.length >= 3) {
        this.suggestedCompanies = await this.$repos.profileRepo
          .searchCompaniesByName(keyword)
          .then((items) => {
            return this.typeCodes?.length
              ? items.filter(item => this.typeCodes.includes(item.typeCode) && !this.hiddenSuggestionsId.includes(item._id))
              : items
          })
      } else {
        this.suggestedCompanies = []
      }
    },

    async onProfileSelected (profile) {
      const detailedProfile = this.isGym
        ? await this.$repos.profileRepo.getGymById(profile._id)
        : await this.$repos.profileRepo.getCompanyDetail(profile._id)

      detailedProfile && this.$emit('suggest', detailedProfile)
      this.suggestedCompanies = []
    }
  }
}
</script>
