<template>
  <base-main-card
    v-if="profile"
    v-bind="{
      ...$attrs,
      actions,
      bodyClass: 'flex flex-col bg-gray-150 bg-opacity-90 h-profile-body',
      title: $t('profile.entities.profile_info')
    }"
    v-on="$listeners"
  >
    <cw-profile-completion-modal
      v-bind="{ ref: 'completionModal', skipInitialCheck: true }"
      :profile-id="profile._id"
      @done="getProfile(profile._id)"
    />

    <div class="bg-white py-4 px-8 flex flex-col items-center">
      <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-150">
        <img
          :src="$utils.getAvatarUrl(profile.avatar)"
          :alt="`${profile.firstname} ${profile.lastname}'s profile`"
          class="w-full max-h-full object-cover"
        >
      </div>

      <span class="text-sm mt-3">
        {{ profile.firstname }} {{ profile.lastname }}
      </span>

      <p v-if="profile.shortDescription" class="mt-4 text-sm text-center">
        {{ profile.shortDescription }}
      </p>

      <cw-profile-social-links v-bind="{ profile }" />
    </div>

    <div class="p-4">
      <div v-for="field in fields" :key="field.label" class="mb-5">
        <div class="text-gray-600 uppercase text-xs">
          {{ field.label }}
        </div>

        <div class="font-semibold text-sm pr-3">
          <div
            v-for="(val, i) in [].concat(field.value).sort()"
            :key="field.label + i"
          >
            {{ val }}
          </div>
        </div>
      </div>

      <div v-if="profile.banks && profile.banks.length" class="mb-5">
        <div class="text-gray-600 uppercase text-xs">
          {{ $t('bank.account.title') }}
        </div>
        <div class="font-semibold pr-3 text-sm">
          <cw-bank-swipe-card
            v-for="(bank, i) in profile.banks"
            :key="bank._id"
            hide-actions
            :bank="bank"
            :class="{ 'mt-2': !!i }"
          />
        </div>
      </div>
    </div>
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ProfileInfoMixin from '@/mixins/ProfileInfoMixin'

export default {
  name: 'BusinessProfileInfoCard',
  mixins: [ProfileInfoMixin],
  inheritAttrs: false,
  computed: {
    ...mapState('profile', ['profile']),
    ...mapGetters('profile', ['allowed', 'viewingSelf']),
    ...mapGetters('settings', ['sportInterests']),
    actions () {
      return !this.allowed('user.edit') && !this.viewingSelf(this.$auth)
        ? []
        : [
          {
            icon: 'pen',
            tooltip: this.$t('profile.actions.edit'),
            handler: () => this.$refs.completionModal?.show?.()
          }
        ]
    }
  },
  created () {
    if (!this.sportInterests?.length) {
      this.getSportInterests()
    }
  },
  methods: {
    ...mapActions('profile', ['getProfile']),
    ...mapActions('settings', ['getSportInterests'])
  }
}
</script>
