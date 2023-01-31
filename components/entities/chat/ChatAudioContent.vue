<template>
  <div class="px-2 pt-1">
    <!-- <cw-profile-avatar
      class="m-auto"
      :class="{'order-1': source.fromProfileId !== $auth.user._id }"
      :src="$utils.getAvatarUrl()"
      :size="12"
      :alt="senderName"
    /> -->
    <audio class="max-w-full h-10" :src="src" controls controlsList="nodownload" @play="setMessageClick" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    source: { type: Object, required: true }
  },
  computed: {
    ...mapState('chat', ['friends']),
    senderName () {
      const { fromProfileId } = this.source
      if (fromProfileId === this.$auth.user._id) {
        return this.$auth.user.displayName
      } else if (this.friends[fromProfileId]) {
        return this.friends[fromProfileId].displayName
      } else {
        return ''
      }
    },
    src () {
      const { audioId, filename } = this.source.content ?? {}
      return this.$utils.getFileUrl(audioId, filename)
    }
  },
  methods: {
    setMessageClick () {
      this.$repos.chatRepo.setMessageClick({ messageId: this.source._id, type: 'audio' })
    }
  }
}
</script>

<style lang="postcss" scoped>
/* .audio-content-wrapper {
  @apply grid gap-3 p-1;
  grid-template-columns: repeat(2, auto);
  grid-template-rows: min-content;
} */
</style>
