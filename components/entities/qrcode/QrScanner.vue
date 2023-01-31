<template>
  <div v-if="visible" class="pt-6 px-6 pb-4 bg-white rounded-md max-w-md mx-auto mt-2">
    <div class="h-64 mb-3">
      <div v-if="cameraShown" class="w-64 h-64 bg-black mx-auto">
        <qrcode-stream @decode="handleInvitationUrl" @init="onQrcodeStreamInit" />
      </div>

      <base-qr-code
        v-else
        :text="qrCode"
        :logo="$auth.user && $utils.getAvatarUrl($auth.user.avatar)"
        class="h-64 mb-3"
      />
    </div>

    <div v-if="$pwa.isGymDevice || !isBusinessAuth">
      <base-button lg inline class="shadow-cw-card focus:shadow-cw-card mx-auto" @click="cameraShown = !cameraShown">
        <base-icon :name="cameraShown ? 'qr-code-circle' : 'qr-code-scan'" class="text-3xl mr-4" />

        {{ $t(cameraShown ? 'qr_scanner.qr_code' : 'qr_scanner.scanner') }}
      </base-button>
    </div>

    <!-- Message popup -->
    <base-confirm-popup
      ref="messagePopup"
      hide-actions
      icon="check-green"
      body-class="italic"
    />

    <cw-profile-completion-modal
      v-if="!isBusinessAuth"
      ref="completionModal"
      skip-initial-check
    />
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader'
export default {
  components: {
    QrcodeStream
  },
  props: {
    visible: { type: Boolean, default: true }
  },
  data () {
    return {
      cameraShown: false,
      isBusinessAuth: this.$auth.isBusiness()
    }
  },
  computed: {
    // User https://dev.cowellness.net/?invitingId=123456
    // Business https://dev.cowellness.net/?invitingId=123456&action=access
    qrCode () {
      const params = new URLSearchParams()
      params.append('invitingId', this.$auth.user._id)
      if (this.$auth.isBusiness()) {
        params.append('action', 'access')
      }
      return `${location.origin}?${params.toString()}`
    }
  },
  mounted () {
    // Handle scanning invitation link from QRcode from out-of-app camera
    // If user hasn't signed in before that, after login he will go to /home and this method shall be called too
    this.handleInvitationUrl(null, true)
  },
  methods: {
    // Check and ask camera permission
    async onQrcodeStreamInit (promise) {
      try {
        await promise
      } catch (e) {
        this.cameraShown = false
        if (e.name !== 'NotAllowedError') {
          this.$notifier.error(this.$t('qr.scanner.error.' + e.name))
        }
      }
    },

    async handleInvitationUrl (text, isMounted) {
      const url = text ? new URL(text) : location
      const params = new URLSearchParams(url.search.slice(1))
      const invitingId = params.get('invitingId')
      const assetId = params.get('assetId')
      const action = params.get('action')

      if (!invitingId) {
        return
      }

      this.cameraShown = false

      if (assetId) {
        return this.$repos.profileRepo.access.getAccess({
          invitedBy: invitingId,
          invitedTo: this.$auth.user._id,
          action: 'access',
          assetId
        })
      }

      const invitorProfile = await this.$repos.profileRepo.getProfileById(invitingId)
      if (!invitorProfile || invitorProfile._id === this.$auth.user._id) {
        return
      }

      const createRelation = action === 'access'
        ? this.isBusinessAuth
          ? this.onBusinessScanBusiness
          : this.onUserScanBusiness
        : this.isBusinessAuth
          ? this.onBusinessScanUser
          : this.onUserScanUser

      if (isMounted && createRelation === this.onUserScanBusiness) {
        // Let completion profile modal handles this so completion profile modal is not opened twice
        return
      }

      const oldRelationStatus = await this.$repos.profileRepo.access.getCurrentRelationStatus({
        invitedBy: invitingId,
        invitedTo: this.$auth.user._id,
        action
      })

      createRelation(invitorProfile, oldRelationStatus === 'active')
    },

    onBusinessScanBusiness (...params) {
      this.createFriendRelation(...params)
    },

    onUserScanUser (...params) {
      this.createFriendRelation(...params)
    },

    async createFriendRelation (profile, hasActiveRelation) {
      if (hasActiveRelation) {
        this.showMessagePopup('qr_scanner.message_popup.already_connected', profile.displayName)
      } else if (await this.$repos.profileDeviceRepo.access.getAccess({
        invitedBy: profile._id,
        invitedTo: this.$auth.user._id,
        action: ['IN', 'TU'].includes(profile.typeCode) ? null : 'access'
      })) {
        this.showMessagePopup('qr_scanner.message_popup.connected', profile.displayName)
      } else {
        this.showMessagePopup('qr_scanner.message_popup.connect_fail', profile.displayName)
      }
    },

    // Only gym device can scan, the qr scanner is hidden from the business dashboard
    onBusinessScanUser (userProfile, hasActiveRelation) {
      if (hasActiveRelation) {
        return this.scanAccess(this.$auth.user, userProfile)
      }

      // Need to accept terms before activate the relation and access the gym
      this.$emit('inactive-relation', {
        profile: userProfile,
        done: user => this.scanAccess(this.$auth.user, user)
      })
    },

    onUserScanBusiness (profile, hasActiveRelation) {
      if (hasActiveRelation) {
        return this.scanAccess(profile, this.$auth.user)
      }

      this.$refs.completionModal.show(() => this.scanAccess(profile, this.$auth.user))
    },

    async scanAccess (gym, user) {
      await this.$repos.profileRepo.access.getAccess({
        invitedBy: gym._id,
        invitedTo: user._id,
        action: 'access'
      })
      this.showMessagePopup('qr_scanner.message_popup.welcome', user.displayName)
    },

    showMessagePopup (messageKey, displayName) {
      this.$refs.messagePopup.show({
        text: this.$t(messageKey, { name: displayName })
      })
      setTimeout(() => this.$refs.messagePopup?.hide?.(), 4000)
    }
  }
}
</script>
