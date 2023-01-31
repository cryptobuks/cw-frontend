<template>
  <div>
    <div class="flex">
      <button
        v-for="({ label, tooltip, frontend, backend }, i) in actions"
        :key="i"
        v-tippy="$t(tooltip)"
        class="action-button"
        @click="handleAction(label, frontend, backend)"
      >
        {{ $t(label) }}
      </button>
    </div>
    <cw-profile-completion-modal v-if="isProfileCompletionModalShown" @done="isProfileCompletionModalShown = false" />
  </div>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  props: {
    actions: { type: Array, required: true },
    messageId: { type: String, required: true }
  },
  data: () => ({
    isProfileCompletionModalShown: false
  }),
  methods: {
    ...mapMutations({
      setCurrentDraft: 'chat/SET_CURRENT_DRAFT'
    }),
    handleAction (label, frontend = {}, backend = {}) {
      this.$repos.chatRepo.setMessageClick({ messageId: this.messageId, type: 'action', value: label })

      const { function: frontendFunction, params: frontendParams } = frontend
      const { function: backendFunction, params: backendParams } = backend

      switch (frontendFunction) {
        case 'autoreply': {
          const { defaultText } = frontendParams

          this.setCurrentDraft({
            text: defaultText
          })

          break
        }
        case 'acceptRole': {
          this.isProfileCompletionModalShown = true
          break
        }
        case 'viewProfile': {
          const { profileId } = frontendParams
          this.$router.push(`/chat/${profileId}/${this.$auth.profileType(this.profile.typeCode).interface}/profile-info`)
          break
        }
      }

      switch (backendFunction) {
        case 'setAppBackground': {
          const { backgroundId } = backendParams

          this.$repos.profileRepo.settings.setAppBackground(
            this.$auth.user._id,
            backgroundId
          )

          break
        }
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.action-button {
  @apply w-full text-base uppercase font-semibold py-1 px-3 border-t border-l border-black border-opacity-25 rounded-none;

  &:first-of-type {
    @apply border-l-0;
  }
}
</style>
