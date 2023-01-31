<template>
  <div class="absolute w-0 h-0">
    <!-- For after successfully acces the gym -->
    <base-confirm-popup
      ref="messagePopup"
      hide-actions
      icon="check-green"
      body-class="italic"
    />

    <cw-individual-profile-modal
      ref="modal"
      @dismiss="onDismiss"
      @hidden="$emit('done')"
    >
      <template #top>
        <div class="text-center mb-6">
          {{ headline }}
        </div>
      </template>

      <template v-if="!belowEmancipation && allowNotShowAgain && closable" #prepend-actions>
        <base-button
          v-tippy="$t('profile_complete.stop_showing_again')"
          inline
          lg
          class="mr-5"
          @click="disable"
        >
          <base-icon name="eye-slash" class="text-3xl" />
        </base-button>
      </template>
    </cw-individual-profile-modal>
  </div>
</template>

<script>
const PROFILE_PENDING_STORAGE_KEY = 'cw:profile_pending'
export default {
  props: {
    // Defer showing the modal until ready is true
    ready: { type: Boolean, default: true },
    profileId: { type: String, default: null },
    skipInitialCheck: Boolean,
    allowNotShowAgain: Boolean
  },
  data () {
    return {
      pendingDocuments: [],
      pendingFields: [],
      headline: this.$t('profile_complete.headline.default'),
      belowEmancipation: false,
      isActivatingAccess: false
    }
  },
  computed: {
    activeProfileId () {
      return this.profileId || this.$auth.user._id
    },

    closable () {
      const types = ['term', 'privacy']
      return !this.pendingDocuments?.length ||
        !this.pendingDocuments.some(
          doc => types.includes(doc.type) &&
            doc.items.some(item => this.$auth.isCW(item.profile?.typeCode))
        )
    }
  },
  async mounted () {
    if (this.skipInitialCheck || !this.$auth.isAuthenticated || this.$auth.isBusiness()) {
      return this.$emit('done')
    }

    // Handle user scans business QR code by normal camera
    const query = this.$route.query
    if (query.invitingId && query.action === 'access' && !query.assetId) {
      const oldRelationStatus = await this.$repos.profileRepo.access.getCurrentRelationStatus({
        invitedBy: query.invitingId,
        invitedTo: this.activeProfileId,
        action: query.action
      })
      this.isActivatingAccess = oldRelationStatus !== 'active'
      if (!this.isActivatingAccess) {
        this.scanAccess(query.invitingId)
      }
    }

    const dob = this.$auth.user?.person?.birth?.date
    if (dob) {
      const countryCode = this.$auth.user?.settings?.language
      const emancipationAge = await this.$repos.authRepo.getEmancipationAge(countryCode)
      this.belowEmancipation = this.$dayjs().year() - this.$dayjs(dob, 'YYYYMMDD').year() < emancipationAge
      if (this.belowEmancipation) {
        const tutors = await this.$repos.profileRepo.getUserTutors(this.activeProfileId)
        this.headline = tutors.length
          ? this.$t('profile_complete.headline.emancipation.with_tutor')
          : this.$t('profile_complete.headline.emancipation.without_tutor')
        return this.show()
      }
    }

    const pendingDocuments = this.pendingDocuments = await this.$repos.contractsRepo
      .getProfileUnsignedDocuments({ profileId: this.activeProfileId })
      .catch(() => [])

    const pendingFields = this.pendingFields = this.getPendingFields()
    const oldPendingState = this.allowNotShowAgain && this.getPendingState()
    const disabled = !oldPendingState
      ? false
      : (
        // Validate profile id, if it's a different profile reset disabled to false
        oldPendingState.profileId === this.activeProfileId
          ? oldPendingState.disabled
            // If there is a new pending field, reset to false
            ? !pendingFields.some(f => !oldPendingState.fields?.includes?.(f)) &&
              !pendingDocuments.some(d => d.items.some(item => !oldPendingState.fields?.includes?.(item.uniqueId)))
            : false
          : false
      )

    this.persistPendingState({
      profileId: this.$auth.user_id,
      disabled,
      fields: pendingDocuments.reduce(
        (arr, cur) => arr.concat(cur.items.map(p => p.uniqueId)),
        []
      ).concat(pendingFields).filter(Boolean)
    })

    if (!disabled && (pendingDocuments.length || pendingFields.length)) {
      this.show()
    }
  },
  methods: {
    async show (callback) {
      const user = await this.$repos.profileRepo.getUserDetail(this.activeProfileId)
      const hiddenFields = ['notes', 'roles', 'source', 'signature']
      if (this.belowEmancipation) {
        hiddenFields.push('documents')
      } else {
        hiddenFields.push('tutors')
      }

      let unwatch = () => {}
      unwatch = this.$watch('ready', (ready) => {
        if (!ready) {
          return
        }

        this.$refs.modal.show(user, {
          hiddenFields: this.pendingFields.includes('password')
            ? hiddenFields
            : hiddenFields.concat('password'),
          requiredFields: [
            {
              fields: ['emails', 'mobiles', 'pins'],
              message: this.$t('profile.validation.email_or_mobile_or_pin')
            },
            'firstname',
            'lastname',
            'dob',
            'password',
            'documents'
          ],
          onDone: (newProfile, { documents }) => {
            documents?.length && this.$repos.contractsRepo.acceptDocuments({
              profileId: this.activeProfileId,
              documents
            })

            callback?.(newProfile)

            if (this.isActivatingAccess) {
              this.scanAccess(newProfile._id)
            }
          },

          closable: this.closable
        })

        unwatch()
      }, { immediate: true })
    },

    onDismiss () {
      this.$refs.modal.hide()
    },

    getPendingFields () {
      const pendingFields = []

      const {
        person: {
          emails = [],
          mobiles = [],
          firstname,
          lastname,
          birth: { date: dob } = {}
        } = {},
        ids = [],
        hasPassword
      } = this.$auth.user

      if (!emails?.length && !mobiles?.length && !ids?.some(id => id.key === 'pin')) {
        pendingFields.push('identifier')
      }

      if (!firstname) {
        pendingFields.push('firstname')
      }

      if (!lastname) {
        pendingFields.push('lastname')
      }

      if (!dob) {
        pendingFields.push('dob')
      }

      if (!hasPassword) {
        pendingFields.push('password')
      }

      return pendingFields
    },

    disable () {
      this.$refs.modal.hide()

      this.persistPendingState({
        ...this.getPendingState(),
        disabled: true
      })
    },

    getPendingState () {
      return this.$utils.parseJSON(localStorage.getItem(PROFILE_PENDING_STORAGE_KEY))
    },

    persistPendingState (state) {
      if (state.disabled) {
        localStorage.setItem(PROFILE_PENDING_STORAGE_KEY, JSON.stringify(state))
      } else {
        localStorage.removeItem(PROFILE_PENDING_STORAGE_KEY)
      }
    },

    async scanAccess (invitedBy) {
      await this.$repos.profileRepo.access.getAccess({
        invitedBy,
        invitedTo: this.activeProfileId,
        action: 'access'
      })
      this.$refs.messagePopup?.show({
        text: this.$t('qr_scanner.message_popup.welcome', { name: this.$auth.user.displayName })
      })
      setTimeout(() => this.$refs.messagePopup?.hide?.(), 4000)
    }
  }
}
</script>
