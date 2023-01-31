<template>
  <div class="access-tracking w-full overflow-hidden flex flex-col">
    <!-- Toggler -->
    <base-button
      lg
      inline
      :class="{ 'is-active': qrBoxShown }"
      class="access-tracking__toggler -mr-1 ml-auto"
      @click="toggleQrBox"
    >
      <base-icon name="qr-code-circle" class="text-4xl mr-3" />

      {{ $t('device_access.access') }}
    </base-button>

    <!-- QR code & scan -->
    <div v-if="qrBoxShown" class="px-4">
      <cw-qr-scanner @inactive-relation="askAcceptTerms" />
    </div>

    <!-- Terms popup -->
    <base-confirm-popup
      ref="termsPopup"
      icon="check-green"
      body-class="italic"
    />
  </div>
</template>

<script>
export default {
  data () {
    return {
      qrBoxShown: false
    }
  },
  methods: {
    toggleQrBox () {
      this.qrBoxShown = !this.qrBoxShown
    },

    askAcceptTerms ({ profile, done }) {
      this.$refs.termsPopup.show({
        text: this.$t('device_access.terms_popup.text', { name: profile.displayName }),
        actions: [
          {
            text: this.$t('device_access.terms_popup.accept'),
            handler: () => {
              this.$refs.termsPopup.hide()

              this.$emit('edit-profile', {
                _id: profile._id,
                onDone: done
              })
            }
          }
        ]
      })
    }
  }
}
</script>

<style lang="scss">
.access-tracking {
  &__toggler {
    padding: 4px 32px !important;
    transition: .5s;

    &.is-active {
      padding: 4px 20px !important;
      transform: translateX(calc(100% - 4.5rem));
    }
  }
}
</style>
