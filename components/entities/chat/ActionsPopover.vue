<template>
  <base-popover ref="popover" @active-change="$emit('active-change', $event)">
    <template #activator>
      <button
        class="hidden w-4 h-4 focus:outline-none text-white text-opacity-60 group-hover:inline-block"
        :style="{ display: persistActionsBtn ? 'inline-block' : null }"
      >
        <svg class="fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z" />
        </svg>
      </button>
    </template>

    <div class="actions">
      <button @click="setReplyToMessageId">
        {{ $t('chat.message_actions.reply') }}
      </button>
      <button v-if="source.content.type !== 'action'" @click="setForwardMessageId">
        {{ $t('chat.message_actions.forward') }}
      </button>
      <a v-if="source.content.type === 'image'" :href="$utils.getFileUrl(source.content.imageId, source.content.filename)" :download="source.content.filename">
        {{ $t('chat.message_actions.download') }}
      </a>
      <a v-if="source.content.type === 'audio' && source.content.audioId" :href="$utils.getFileUrl(source.content.audioId, source.content.filename)" :download="source.content.filename">
        {{ $t('chat.message_actions.download') }}
      </a>

      <button v-if="!source.isViewed" @click="deleteMessage">
        {{ $t('chat.message_actions.delete') }}
      </button>
    </div>
  </base-popover>
</template>

<script>
export default {
  props: {
    source: { type: Object, required: true },
    persistActionsBtn: { type: Boolean, default: false }
  },
  methods: {
    setReplyToMessageId () {
      this.$store.commit('chat/SET_REPLY_TO_MESSAGE_ID', this.source._id)
      this.hide()
    },
    setForwardMessageId () {
      this.$store.commit('chat/SET_FORWARD_MESSAGE_ID', this.source._id)
      this.hide()
    },
    deleteMessage () {
      this.$store.dispatch('chat/deleteMessage', this.source)
      this.hide()
    },
    hide () {
      this.$refs.popover.hide()
    }
  }
}
</script>

<style lang="postcss" scoped>
.actions {
  min-width: theme('space.32');
  @apply flex flex-col bg-white rounded px-0 py-1;

  & button,
  & a {
    @apply rounded-none text-sm text-left px-4 py-2;

    &:focus {
      @apply outline-none;
    }

    &:hover {
      @apply bg-gray-200;
    }
  }
}
</style>
