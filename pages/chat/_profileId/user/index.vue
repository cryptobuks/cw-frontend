<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      actions,
      bodyClass: 'flex flex-col h-full',
      title: $t('entities.profile')
    }"
  >
    <nuxt-child
      v-bind="{
        hideSearch: true,
        showBackButton: true,
        profile,
        previousPage: `/chat/${$route.params.profileId}/user`
      }"
    />
    <div class="py-4 px-4 bg-white flex flex-col">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <img
            :src="$utils.getAvatarUrl(profile.avatar)"
            :alt="`${profile.firstname}'s profile`"
            class="w-16 h-16 rounded-full object-cover"
          >
          <div class="space-y-1 flex flex-col">
            <h4 class="font-bold block">
              {{ profile.firstname }} {{ profile.lastname }}
            </h4>
            <cw-manage-roles v-if="$auth.isBusiness()" v-bind="{ profile }" />
            <div v-else-if="viewingSelf($auth)" class="text-xs">
              {{ profile.shortDescription }}
            </div>
          </div>
        </div>
        <nuxt-link :to="`${$route.path}/profile-info`" class="ml-3">
          <base-icon name="chevron-right" class="cursor-pointer" />
        </nuxt-link>
      </div>
      <div
        v-if="
          allowed('user.weight_and_price') ||
            $auth.isBusiness() ||
            viewingSelf($auth)
        "
        class="flex justify-between items-center mt-8"
      >
        <base-icon
          name="profile-completeness"
          :replace="{ text: `${profileCompleteness}%` }"
          size="50"
        />
        <base-icon name="libra" :replace="{ text: weight }" size="50" />
        <base-icon name="prize" :replace="{ text: '4' }" size="50" />
      </div>
      <div
        v-if="filteredList && filteredList.length > 0 && $auth.isBusiness()"
        class="mx-8 lg:mx-12 flex mt-10 min-h-48"
      >
        <base-grouped-cards
          :slot-data="filteredList"
          :parent-data="filteredList"
          class="w-full"
        />
      </div>
      <div
        v-if="$auth.isUser() && false"
        class="flex flex-wrap items-center justify-between py-4 border-b mt-4"
      >
        <cw-custom-select
          v-model="performanceRole"
          v-bind="{
            display: (role) => $t(`roles.${role}`),
            items: roles,
            itemText: (role) => $t(`roles.${role}`)
          }"
          class="mb-3"
        />
        <div class="space-x-4 flex items-center capitalize">
          <div class="flex flex-col items-center">
            <base-super-imposed status="50" />
            <span class="text-xs">{{ $t('performance.economic') }}</span>
          </div>
          <div class="flex flex-col items-center">
            <base-super-imposed status="50" />
            <span class="text-xs">{{ $t('performance.relationship') }}</span>
          </div>
          <div class="flex flex-col items-center">
            <base-super-imposed status="80" />
            <span class="text-xs">{{ $t('performance.contributive') }}</span>
          </div>
        </div>
      </div>
      <div v-if="$auth.isBusiness()">
        <div
          v-if="userRelationship.status === 'temporary'"
          class="flex mt-3 items-center justify-between text-red font-bold"
        >
          <div class="flex items-center space-x-6">
            <base-icon name="person" size="20" />
            <span class="text-sm capitalize">
              {{ $t('profile.user.to_be_confirmed') }}
            </span>
          </div>
          <span class="text-sm">
            {{ $dayjs(profile.createdAt).diff($dayjs(), 'day') }}
            {{ $t('global.days') }}
          </span>
        </div>
        <div class="flex mt-3 items-center justify-between text-red font-bold">
          <div class="flex items-center space-x-6">
            <base-icon name="heart" size="20" />
            <span class="text-sm capitalize">{{
              $t('profile.user.reactivate_relationship')
            }}</span>
          </div>
          <base-switcher
            v-if="false"
            v-model="relationshipActivation"
            v-bind="{
              class: 'border rounded-full my-4',
              falseColor: 'red',
              falseText: $t('global.prospect'),
              trueText: $t('profile.user.no_prospect')
            }"
          />
        </div>
        <div class="flex mt-3 items-center justify-between font-bold">
          <span class="text-sm capitalize">{{
            $t('profile.user.is_interesting')
          }}</span>
          <base-switcher
            v-model="isInteresting"
            v-bind="{
              class: 'border rounded-full my-4',
              falseColor: 'red',
              falseText: $t('global.no'),
              trueText: $t('global.yes')
            }"
          />
        </div>
        <div class="flex items-center mt-3">
          <button
            class="border border-gray-500 rounded-lg focus:outline text-gray-700 w-24 py-2"
            @click="sendToDevice('RESET_PASSWORD')"
          >
            <base-icon name="reset-password" size="25" />
          </button>
          <button
            class="border border-gray-500 rounded-lg focus:outline text-gray-700 py-2 w-full ml-4 capitalize"
            @click="sendToDevice('COMPLETE_INDIVIDUAL_PROFILE')"
          >
            {{ $t('profile.user.send_to_device') }}
          </button>
        </div>
        <button
          class="border h-10 border-gray-500 rounded-lg focus:outline text-gray-700 py-2 w-full mt-2 capitalize"
          :class="[sendingRegLink ? 'opacity-40 cursor-not-allowed' : '']"
          @click="
            () => (profile.status === 'active' ? allowAccess() : sendRegLink())
          "
        >
          <div
            v-if="sendingRegLink"
            class="inset-0 z-10 flex justify-center items-center rounded bg-transparent"
          >
            <base-spinner size="sm" />
          </div>
          <span v-else>
            {{
              $t(
                profile.status === 'active'
                  ? 'profile.user.allow_access'
                  : 'profile.user.send_reg_link'
              )
            }}
          </span>
        </button>
      </div>
      <cw-profile-social-links v-if="viewingSelf($auth)" v-bind="{ profile }" />
    </div>

    <div class="pt-1 bg-gray-150 bg-opacity-90">
      <div v-if="$auth.isBusiness() || viewingSelf($auth)">
        <cw-profile-section-item
          v-bind="{
            title: 'profile.entities.relationships',
            icon: 'customer'
          }"
          @click="onSectionClick({ to: 'relationships' })"
        />

        <cw-profile-section-item
          v-bind="{
            title: 'profile.entities.subscriptions',
            icon: 'dollar-circle'
          }"
          @click="onSectionClick({ title: 'profile.entities.subscriptions' })"
        >
          <template #right-content>
            <base-icon name="alert-circle" size="20" class="text-red mr-4" />
          </template>
        </cw-profile-section-item>

        <cw-profile-section-item
          v-bind="{
            title: 'profile.entities.training_plans',
            icon: 'clock'
          }"
          @click="onSectionClick({ title: 'profile.entities.training_plans' })"
        >
          <template #right-content>
            <span
              class="rounded-full bg-green text-white text-sm w-5 h-5 text-center mr-4"
            >5</span>
          </template>
        </cw-profile-section-item>

        <cw-profile-section-item
          v-bind="{
            title: 'profile.entities.performance',
            icon: 'performance'
          }"
          @click="onSectionClick({ to: 'performance' })"
        >
          <template #right-content>
            <span class="mr-4 //-flex items-center hidden">
              <base-icon name="arrow-up" class="text-green" size="20" />
              5%
            </span>
          </template>
        </cw-profile-section-item>

        <cw-profile-section-item
          v-bind="{
            title: 'profile.entities.prizes',
            icon: 'prize',
            iconText: 3
          }"
          @click="onSectionClick({ title: 'profile.entities.prizes' })"
        />

        <cw-profile-section-item
          v-if="$auth.isBusiness() || viewingSelf($auth)"
          v-bind="{
            title: 'profile.entities.certificates',
            icon: 'certificate'
          }"
          @click="onSectionClick({ to: 'certificates' })"
        >
          <template #right-content>
            <span
              class="rounded-full bg-red text-white text-sm w-5 h-5 text-center mr-4"
            >!</span>
          </template>
        </cw-profile-section-item>

        <cw-profile-section-item
          v-for="section in sections"
          :key="section.component"
          v-bind="section"
          @click="onSectionClick(section)"
        />
      </div>
      <cw-block-profile v-bind="{ profile }" />
    </div>

    <cw-send-to-gym-device-popup
      v-if="!$pwa.isStandalone"
      ref="sendToDevicePopup"
      class="mr-5"
    />
  </base-main-card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import ProfileInfoMixin from '@/mixins/ProfileInfoMixin'

export default {
  mixins: [ProfileInfoMixin],
  inheritAttrs: false,
  props: { profile: { type: Object, required: true } },
  async fetch () {
    await this.getBio(this.profile._id)
  },
  data: () => ({
    performanceRole: null,
    relationshipActivation: true,
    roles: [],
    sendingRegLink: false
  }),
  computed: {
    ...mapGetters('dashboard', ['mappedCardGetter']),
    ...mapGetters('profile', [
      'allowed',
      'businessRoles',
      'getSortedBio',
      'viewingSelf'
    ]),
    ...mapState('profile', [
      'managedProfiles',
      'userRelationship',
      'userRoles'
    ]),
    actions () {
      const actions = [
        { icon: 'dismiss', handler: () => this.close(), size: 16 }
      ]
      if (this.managedProfiles.length > 1) {
        actions.unshift({ icon: 'out-of-office' })
      }
      return actions
    },
    filteredList () {
      return this.messages.reduce((all, item) => all.concat(item), [])
    },
    isInteresting: {
      get () {
        return !!this.userRelationship.isInteresting
      },
      async set (value) {
        await this.$repos.profileRepo.individual.setInterest(
          this.profile._id,
          value
        )
        this.getProfile(this.profile._id)
      }
    },
    messages () {
      return this.mappedCardGetter(this.$auth)
    },
    profileCompleteness () {
      const total = 9
      return Math.round((this.fields.length / total) * 100)
    },
    sections () {
      return [
        {
          icon: 'contract',
          title: 'profile.entities.contracts',
          to: 'contracts',
          hide: this.$auth.isUser() && !this.viewingSelf(this.$auth)
        },
        {
          icon: 'booking',
          title: 'profile.entities.bookings'
        },
        {
          icon: 'wallet',
          title: 'profile.entities.credit_wallet',
          to: 'wallet'
        },
        {
          icon: 'shopping',
          title: 'profile.entities.purchases'
        },
        {
          icon: 'alert-triangle',
          title: 'global.violations'
        },
        {
          icon: 'settings',
          title: 'global.settings',
          to: 'settings',
          hide: !this.viewingSelf(this.$auth)
        },
        {
          icon: 'out-of-office',
          title: 'profile.entities.out_of_office',
          hide:
            (this.roles.length < 1 && !this.viewingSelf(this.$auth)) ||
            this.managedProfiles.length <= 1
        },
        {
          icon: 'door',
          title: 'profile.entities.accesses',
          to: 'accesses'
        },
        {
          icon: 'qr-code',
          title: 'profile.entities.membership',
          to: 'qr-code'
        },
        {
          icon: 'customer',
          title: 'profile.entities.assigned_contacts',
          hide: true
        }
      ].filter(s => !s.hide)
    },
    weight () {
      const weight = this.getSortedBio[0]?.body?.weight
      const weightFormat = this.$auth.user.settings.weightFormat || 'kg'
      const numberFormat = this.$auth.user.settings.numberFormat
      return weight
        ? this.$utils.formatMeasurement(
          weight,
          weightFormat,
          'kg',
          numberFormat
        ) + weightFormat
        : '-'
    }
  },
  watch: {
    userRoles: {
      immediate: true,
      deep: true,
      handler (roles) {
        // filter for business roles
        this.roles = this.$utils.clone(
          roles.filter(role => this.businessRoles.includes(role))
        )
        this.performanceRole = this.roles[0] || null
      }
    }
  },
  methods: {
    ...mapActions('profile', ['getBio', 'getUserRoles', 'getProfile']),
    allowAccess () {
      // TODO:: Action to  open the GYM gate and let the profile enter the GYM. https://cowellness.atlassian.net/browse/CW-1507
    },
    close () {
      this.$router.push('/chat')
    },
    onSectionClick ({ modal, title, to }) {
      if (to) {
        this.$router.push(`${this.$route.path}/${to}`)
      } else if (modal) {
        this.$refs[modal]?.show?.()
      } else {
        this.$router.push(`${this.$route.path}/coming-soon?entity=${title}`)
      }
    },
    async sendRegLink () {
      this.sendingRegLink = true
      await this.$repos.profileRepo.individual.sendRegLink(this.profile._id)
      this.sendingRegLink = false
      this.$notifier.success(
        this.$t('profile.user.reglink_sent', { email: this.profile.email })
      )
    },
    sendToDevice (action) {
      this.profile &&
        this.$refs.sendToDevicePopup.show({
          action,
          payload: {
            _id: this.profile._id
          }
        })
    }
  }
}
</script>
