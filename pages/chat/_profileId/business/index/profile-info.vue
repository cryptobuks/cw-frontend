<template>
  <base-main-card
    v-if="profile"
    v-bind="{
      ...$attrs,
      actions,
      bodyClass: 'flex flex-col bg-gray-150 bg-opacity-90 h-full',
      title: $t('profile.entities.profile_info')
    }"
    v-on="$listeners"
  >
    <cw-profile-completion-modal
      v-bind="{ ref: 'completionModal', skipInitialCheck: true }"
      @done="getProfile(profile._id)"
    />
    <div class="bg-white py-4 px-8 flex flex-col items-center">
      <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-150">
        <img
          :src="$utils.getAvatarUrl(profile.avatar)"
          :alt="`${profile.brand || profile.name}'s profile`"
          class="w-full max-h-full object-cover"
        >
      </div>

      <span class="text-sm mt-3">
        {{ profile.brand || profile.name }}
      </span>

      <p v-if="profile.shortDescription" class="mt-4 text-sm text-center">
        {{ profile.shortDescription }}
      </p>

      <div
        v-if="profile.onlineLinks && profile.onlineLinks.length"
        class="mt-8 flex justify-between items-center w-full"
      >
        <a
          v-for="site in profile.onlineLinks"
          :key="site._id"
          :href="site.link"
          rel="noopener noreferrer nofollow"
          target="_blank"
          class="inline-block no-underline hover:no-underline"
        >
          <base-icon
            :name="'social-' + (site.type === 'url' ? 'web' : site.type)"
            :size="site.type === 'url' ? 40 : 25"
          />
        </a>
      </div>
    </div>

    <cw-block-profile v-bind="{ profile }" />
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
          {{ $t('profile.info.bank_account') }}
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

      <div v-if="profile.mailInChat" class="mb-5">
        <div class="text-gray-600 uppercase text-xs">
          {{ $t('gym.mailInChat.label') }}
        </div>
        <div class="font-semibold pr-3 text-sm">
          {{ profile.mailInChat }}@sportmail.net
        </div>
      </div>

      <div v-if="profile.directors && profile.directors.length">
        <div class="font-semibold pr-3">
          <base-swipe-card
            v-for="(director, i) in profile.directors"
            :key="director._id"
            auto-height
            bg-color="#404040"
            hide-actions
            :class="{ 'mt-2': !!i }"
          >
            <template #title>
              {{
                [director.profile.firstname, director.profile.lastname]
                  .filter(Boolean)
                  .join(' ') ||
                  (viewingSelf($auth) && director.profile.emails[0]) ||
                  (director.profile.mobiles[0] &&
                    director.profile.mobiles[0].prefixNumber +
                    director.profile.mobiles[0].phoneNumber) ||
                  (director.profile.pins[0] &&
                    director.profile.pins[0].countryCode +
                    director.profile.pins[0].value)
              }}
              <span class="text-base font-normal">
                {{ $t('profile.info.director') }}
              </span>
            </template>
          </base-swipe-card>
        </div>

        <div class="w-32 ml-auto text-gray-600 uppercase flex-shrink-0">
          {{ $t('profile.info.directors') }}
        </div>
      </div>
    </div>
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
export default {
  inheritAttrs: false,
  computed: {
    ...mapState('profile', ['profile']),
    ...mapGetters('profile', ['allowed', 'viewingSelf']),
    actions () {
      return !this.allowed('business.edit') && !this.viewingSelf(this.$auth)
        ? []
        : [
          {
            icon: 'pen',
            tooltip: this.$t('profile.actions.edit'),
            handler: () => this.$refs.completionModal?.show?.()
          }
        ]
    },
    fieldsOpts () {
      return [
        { label: 'Name', from: 'name' },
        { label: 'Brand', from: 'brand' },
        {
          from: 'vat',
          transform: vat => vat && vat.countryCode?.toUpperCase() + vat.value
        },
        {
          from: 'fiscal',
          transform: fiscal => fiscal?.value
        },
        {
          from: 'address',
          transform: addr => [addr?.fulladdress].filter(Boolean)
        },
        {
          from: 'pec',
          hidden: this.$auth.isUser()
        },
        {
          from: 'emails',
          transform: emails => emails.filter(Boolean),
          hidden: this.$auth.isUser()
        },
        {
          from: 'mobiles',
          transform: mobiles =>
            mobiles.map(m => m.prefixNumber + ' ' + m.phoneNumber),
          hidden: this.$auth.isUser()
        },
        {
          from: 'landlines',
          transform: landlines =>
            landlines.map(m => m.prefixNumber + ' ' + m.phoneNumber),
          hidden: this.$auth.isUser()
        },
        {
          from: 'pins',
          transform: pins => pins.map(pin => pin.value),
          hidden: this.$auth.isUser()
        },
        {
          from: 'sdi',
          hidden: this.$auth.isUser()
        },
        {
          from: 'balanceStartDate',
          transform: d =>
            d instanceof Date && !isNaN(d)
              ? d.getDate() + '-' + (d.getMonth() + 1)
              : null,
          hidden: this.$auth.isUser()
        }
      ]
    },
    fields () {
      const extracted = this.$utils.extract(this.profile, this.fieldsOpts)

      if (extracted.address && this.profile?.operativeAddresses?.length) {
        extracted.address.push(
          ...this.profile.operativeAddresses.map(a => a.fulladdress)
        )
      }

      return this.fieldsOpts
        .map(f => ({
          hidden: !!f.hidden,
          label: this.$t(`profile.info.${f.from}`),
          value: extracted[f.from]
        }))
        .filter(
          f => !f.hidden && (Array.isArray(f.value) ? f.value[0] : f.value)
        )
    }
  },
  methods: {
    ...mapActions('profile', ['getProfile'])
  }
}
</script>
