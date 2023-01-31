<template>
  <div>
    <base-select
      v-if="!value"
      v-bind="$attrs"
      :value="null"
      :items="suggestedProfiles.concat([{ text: $t('input.individual_profile.new_contact') }])"
      :item-text="getProfileText"
      :debounce-duration="300"
      v-on="$utils.except($listeners, 'input')"
      @search="searchProfiles"
      @item-select="onProfileSelected"
    />

    <base-swipe-card
      v-else
      :title="value.displayName"
      bg-color="#404040"
      auto-height
      class="mb-4"
      @edit="showProfileModal(value._id)"
      @remove="setProfile(null)"
    >
      <div v-if="value.emails && value.emails.length" class="mb-1">
        {{ value.emails[0] }}
      </div>

      <div v-if="value.mobiles && value.mobiles.length" class="mb-1">
        {{ value.mobiles[0].prefixNumber }} {{ value.mobiles[0].phoneNumber }}
      </div>

      <div v-if="value.pins && value.pins.length" class="uppercase">
        {{ value.pins[0].value }}
      </div>
    </base-swipe-card>

    <profile-modal ref="profileModal" @done="setProfile" />
  </div>
</template>

<script>
export default {
  components: {
    ProfileModal: () => import('~/components/entities/profile/IndividualProfileModal')
  },
  inheritAttrs: false,
  props: {
    // profile
    value: { type: Object, default: null },
    role: { type: String, default: null },
    countryCode: { type: String, default: null },
    hiddenProfilesId: { type: Array, default: () => [] }
  },
  data () {
    return {
      suggestedProfiles: [],
      searchText: ''
    }
  },
  methods: {
    async searchProfiles (keyword) {
      this.searchText = keyword
      if (keyword && keyword.length >= 2) {
        this.suggestedProfiles = (await this.$repos.profileRepo.searchUserProfiles(keyword))
          .filter(p => !this.hiddenProfilesId.includes(p._id))
      } else {
        this.suggestedProfiles = []
      }
    },

    onProfileSelected (profile) {
      if (profile?._id) {
        this.setProfile(profile)
      } else {
        this.showProfileModal()
      }
    },

    async showProfileModal (_id) {
      const profile = _id && await this.$repos.profileRepo.getUserDetail(_id)
      this.$refs.profileModal.show(profile, { role: this.role, countryCode: this.countryCode })
    },

    setProfile (profile = null) {
      this.$emit('input', profile)
      this.$attrs.listeners?.validated?.()
    },

    getProfileText (profile) {
      if (profile.text) {
        return profile.text
      }

      const searchText = this.searchText.toLowerCase()
      const { firstname, lastname, pins: [pin] = [], emails: [email] = [], mobiles: [mobile] = [] } = profile
      const texts = [
        [firstname, lastname].filter(Boolean).join(' '),
        email,
        pin && pin.countryCode + pin.value,
        mobile && mobile.prefixNumber + ' ' + mobile.phoneNumber
      ]

      const [main, ...others] = texts
      const othersText = searchText && others.filter(t => t?.toLowerCase().includes(searchText)).join(', ')
      return main + (othersText ? ` (${othersText})` : '')
    }
  }
}
</script>
