<template>
  <base-modal
    v-model="active"
    :title="$t('push_subscription.title')"
    body-class="flex justify-center items-center text-center"
    @hidden="$emit('done')"
  >
    <div class="inline-block p-16" v-html="$t('push_subscription.text')" />

    <template #actions>
      <base-button inline xl class="mr-5" @click="disable">
        <base-icon name="eye-slash" class="text-3xl" />
      </base-button>

      <base-button xl @click="enable">
        {{ $t('push_subscription.enable') }}
      </base-button>
    </template>
  </base-modal>
</template>

<script>
export default {
  data: () => ({
    active: false
  }),
  async mounted () {
    if (this.$auth.isUser() && this.$push.isSupported && !this.isDisabled()) {
      await this.$pwa.serviceWorkerReady()

      if (!(await this.$push.hasActiveSubscription())) {
        this.active = true
        return
      }
    }

    this.$emit('done')
  },
  methods: {
    isDisabled () {
      try {
        const profileId = localStorage.getItem('cw:disable_push_sub')
        return profileId === this.$auth.user._id
      } catch (_) {}

      return false
    },

    disable () {
      this.active = false

      localStorage.setItem('cw:disable_push_sub', this.$auth.user._id)
    },

    enable () {
      this.active = false

      this.$push.subscribe()
    }
  }
}
</script>
