<template>
  <base-main-card
    v-bind="{
      ...$attrs,
      bodyClass: 'flex flex-col bg-gray-150 bg-opacity-90 h-full',
      title: $t('global.notifications'),
    }"
    v-on="$listeners"
  >
    <div class="h-full bg-white flex flex-col space-y-3 p-3">
      <div
        v-for="(notification, channel) in notifications"
        :key="channel"
        class="border rounded-lg h-16 w-full p-4 flex items-center justify-between"
      >
        <div class="flex items-center">
          <base-icon v-bind="{ name: notification.icon, size: 20 }" />
          <span class="font-extrabold text-sm ml-3">
            {{ $t(`contact_channel.${channel}`) }}
          </span>
        </div>
        <base-switcher
          v-model="notification.val"
          class="border rounded-full"
          v-bind="{ falseColor: '#be0000' }"
          @input="submit"
        />
      </div>
    </div>
  </base-main-card>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  props: { profile: { type: Object, required: true } },
  data: () => ({
    notifications: {
      sms: { icon: 'messages', val: true },
      email: { icon: 'mail', val: true }
      // skype: { icon: "social-skype", val: true },
      // messenger: { icon: "social-facebook", val: true },
      // whatsapp: { icon: "social-facebook", val: true },
    }
  }),
  created () {
    this.setNotifications()
  },
  methods: {
    ...mapActions('profile', ['getProfile']),
    setNotifications () {
      for (const [notification, value] of Object.entries(this.notifications)) {
        value.val = !!this.profile.settings.notification?.[notification]
      }
    },
    async submit () {
      const payload = {}
      for (const [channel, value] of Object.entries(this.notifications)) {
        payload[channel] = value.val
      }

      await this.$repos.profileRepo.settings.setNotifications(payload)
      this.$notifier.success(this.$t('global.success'))
      this.getProfile(this.profile._id)
    }
  }
}
</script>

<style>
</style>
