<template>
  <base-modal
    v-if="!gym || !$pwa.deviceInfo"
    :title="$t('global.connected')"
    active
    persistent
    hide-overlay
    :dismissible="false"
    body-class="flex justify-center items-center text-center"
  >
    {{ $t('device_home.auth_fail.text') }}
  </base-modal>

  <div v-else class="fixed w-full h-full overflow-auto text-center text-white">
    <header class="pt-5 border-b border-gray-400 mb-1 min-h-16">
      <h1 class="text-2xl ledaing-loose">
        {{ brand }}
      </h1>

      <div v-if="$pwa.deviceInfo && $pwa.deviceInfo.name" class="text-xs leading-loose">
        {{ $pwa.deviceInfo.name }}
      </div>
    </header>

    <main class="pb-20 overflow-hidden">
      <h3 class="text-xl leading-loose mb-16">
        {{ $t('device_home.welcome') }}
      </h3>

      <div class="flex flex-col items-center justify-center">
        <cw-device-access-tracking
          class="mb-16 mb:lg-20 lg:mb-24 w-full"
          @edit-profile="pushToQueue({ action: actions.COMPLETE_INDIVIDUAL_PROFILE, data: $event })"
        />

        <div class="mb-16 md:mb-20 lg:mb-24 w-full px-4">
          <base-button to="/device/book-your-shift" xl class="mx-auto max-w-md overflow-hidden">
            {{ $t('device_home.book_your_shift') }}
          </base-button>
        </div>

        <div class="mb-16 md:mb-20 lg:mb-24 w-full px-4">
          <base-button to="/device/ask-info" xl class="mx-auto max-w-md overflow-hidden">
            {{ $t('device_home.ask_info') }}
          </base-button>
        </div>
      </div>
    </main>

    <cw-new-profile-modal ref="profileModal" @hidden="processQueue(true)" />

    <cw-device-password-reset-modal ref="resetPasswordModal" @hidden="processQueue(true)" />

    <cw-birth-date-validation-popup ref="dobValidationPopup" @fail="processQueue(true)" />
  </div>
</template>

<script>
export default {
  auth: false,
  data () {
    return {
      // { action, payload: { _id?, draft?, onDone? } }
      queue: [],
      // Ensure each action in queue run after another
      isFree: true,

      // Action types of Send to gym device flow
      actions: {
        COMPLETE_INDIVIDUAL_PROFILE: 'COMPLETE_INDIVIDUAL_PROFILE',
        CREATE_NEW_PROFILE: 'CREATE_NEW_PROFILE',
        RESET_PASSWORD: 'RESET_PASSWORD'
      }
    }
  },
  computed: {
    gym () {
      return this.$auth.user
    },

    brand () {
      return this.gym?.company?.brand || this.gym?.company?.name
    }
  },
  created () {
    this.setupSendToGymDeviceFlow()
  },
  methods: {
    setupSendToGymDeviceFlow () {
      if (!this.gym) {
        return
      }

      const SEND_TO_GYM_DEVICE_EVENT = 'device/auth/sendToDevice'
      const handler = payload => this.pushToQueue(payload)

      this.$socket.on(SEND_TO_GYM_DEVICE_EVENT, handler)

      this.$once('beforeDestroy', () => {
        this.$socket.off(SEND_TO_GYM_DEVICE_EVENT, handler)
      })
    },

    pushToQueue (item) {
      this.queue.push(item)
      this.processQueue()
    },

    processQueue (next) {
      if (next) {
        this.isFree = true
      }

      if (!this.isFree || !this.queue.length) {
        return
      }

      this.isFree = false

      const item = this.queue.shift()

      switch (item.action) {
        case this.actions.COMPLETE_INDIVIDUAL_PROFILE:
          this.handleCompleteIndividualProfile(item.data)
          break
        case this.actions.CREATE_NEW_PROFILE:
          this.handleCreateNewProfile(item.data)
          break
        case this.actions.RESET_PASSWORD:
          this.handleResetPassword(item.data)
          break
      }
    },

    async handleResetPassword ({ _id } = {}) {
      const profile = _id && await this.$repos.profileRepo.getUserDetail(_id)
      if (!profile) {
        return
      }

      if (profile.hasPassword && profile.dob) {
        this.$refs.dobValidationPopup.show({
          dob: profile.dob,
          title: profile.displayName,
          onDone: () => this.$refs.resetPasswordModal.show(profile),
          errorMessage: this.$t('device_home.dob_validation.fail.password')
        })
      } else {
        this.$refs.resetPasswordModal.show(profile)
      }
    },

    handleCreateNewProfile ({ draft } = {}) {
      const isIndividual = !draft?.typeCode || draft?.typeCode === 'IN' || draft?.typeCode === 'TU'
      if (isIndividual) {
        this.showIndividualProfileModal({ draft, hasSwitcher: true })
      } else {
        this.$refs.profileModal.show({
          individual: false,
          hasSwitcher: true,
          params: [draft]
        })
      }
    },

    async handleCompleteIndividualProfile ({ _id, draft, onDone } = {}) {
      const originalProfile = _id && await this.$repos.profileRepo.getUserDetail(_id)
      if (_id && !originalProfile) {
        return this.processQueue(true)
      }

      const onConfirmDobPopupDone = () => this.showIndividualProfileModal({ draft, originalProfile, onDone })

      if (originalProfile.dob && originalProfile?.hasPassword) {
        this.$refs.dobValidationPopup.show({
          dob: originalProfile.dob,
          title: originalProfile.displayName,
          onDone: onConfirmDobPopupDone,
          errorMessage: this.$t('device_home.dob_validation.fail.profile')
        })
      } else {
        onConfirmDobPopupDone()
      }
    },

    async showIndividualProfileModal ({ draft, originalProfile, hasSwitcher = false, onDone }) {
      const relation = originalProfile?._id && await this.$repos.gymDeviceRepo.verifyUserRelation(originalProfile._id)
      const hasActiveRelation = relation?.status === 'active'

      const hiddenFields = ['notes', 'source', 'roles']

      if (originalProfile?.hasPassword) {
        hiddenFields.push('password')
      }

      if (hasActiveRelation) {
        hiddenFields.push('signature')
      }

      this.$refs.profileModal.show({
        individual: true,
        hasSwitcher,
        params: [
          originalProfile,
          {
            hiddenFields,
            requiredFields: [
              {
                fields: ['emails', 'mobiles', 'pins'],
                message: this.$t('profile.validation.email_or_mobile_or_pin')
              },
              'firstname',
              'lastname',
              'dob',
              'documents',
              'password',
              'signature'
            ],
            draft,
            onDone: (newProfile, draft) => {
              // Probably scan access
              onDone?.(newProfile)

              // Activate relationship
              !hasActiveRelation && this.$repos.contractsRepo.acceptDocuments({
                profileId: newProfile._id,
                deviceId: this.$pwa.deviceInfo.id,
                signature: draft.signature,
                documents: draft.documents
              })
            }
          }
        ]
      })
    }
  }
}
</script>
