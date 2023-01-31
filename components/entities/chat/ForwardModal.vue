<template>
  <base-modal
    ref="baseModal"
    :title="$t('chat.forward_modal.forward')"
    :active="active"
    @active-change="onActiveChange"
  >
    <template #activator>
      <slot />
    </template>

    <base-input-text
      v-model="filterQuery"
      :placeholder="$t('global.search')"
      class="bg-white h-12 mx-auto px-4 rounded-10px"
      prepend-icon="search"
      style="width: 70%"
      light
      naked
      @clear="filterQuery = ''"
    />

    <div class="flex flex-col space-y-2 w-4/5 mt-8 mx-auto">
      <label
        v-for="({ _id, displayName, avatarUrl }) in matchingChats"
        :key="_id"
        class="flex justify-between items-center bg-white h-14 px-4 rounded-10px cursor-pointer select-none"
      >
        <input v-model="selectedChatIds" type="checkbox" :value="_id" class="absolute w-0 h-0 overflow-hidden">
        <span class="flex items-center">
          <!-- TODO: Replace with profile image when available -->
          <img class="w-10 h-10 rounded-full" :src="avatarUrl">
          <span class="text-black font-semibold ml-5">
            {{ displayName }}
          </span>
        </span>
        <span class="check-indicator" />
      </label>
    </div>

    <template #actions>
      <base-button
        lg
        class="base-modal__actions__submit uppercase"
        :disabled="!selectedChatIds.length"
        :loading="submitting"
        @click="forward"
      >
        {{ $t('chat.forward_modal.forward') }}
      </base-button>
    </template>
  </base-modal>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  model: {
    prop: 'active',
    event: 'active-change'
  },
  props: {
    active: { type: Boolean, default: false },
    messageId: { type: String, default: '' }
  },
  data: () => ({
    filterQuery: '',
    selectedChatIds: [],
    submitting: false
  }),
  computed: {
    ...mapState('chat', ['currentChat']),
    ...mapGetters('chat', ['getMessagesOrderedByCreatedAt']),
    message () {
      const currentChatMessages = this.getMessagesOrderedByCreatedAt(this.currentChat)
      return currentChatMessages.find(m => m._id === this.messageId)
    },
    sortedChats () {
      return this.$auth.isBusiness()
        ? this.$store.getters['chat/getBusinessChatsSorted'](this.$auth._id)
        : this.$store.getters['chat/getUserChatsSorted']
    },
    filteredChats () {
      return this.sortedChats.filter(({ chatId }) => !chatId.startsWith('S-') && !chatId.startsWith('B-'))
        .map(chat => ({
          ...chat,
          avatarUrl: this.$utils.getAvatarUrl(
            chat.avatar,
            chat.chatId.startsWith('G-') ? 'group' : 'chat')
        })
        )
    },
    filteredChatsById () {
      const output = {}

      this.filteredChats.forEach((chat) => {
        output[chat._id] = chat
      })

      return output
    },
    matchingChats () {
      return this.filteredChats.filter(({ displayName }) => displayName?.toLowerCase()?.includes(this.filterQuery?.toLowerCase()))
    }
  },
  methods: {
    ...mapMutations('chat', {
      setForwardMessageId: 'SET_FORWARD_MESSAGE_ID'
    }),
    onActiveChange (isActive) {
      if (!isActive) {
        // Reset component state
        Object.assign(this.$data, this.$options.data.call(this))

        this.setForwardMessageId(null)
      }

      this.$emit('active-change', isActive)
    },
    show () {
      this.$refs.baseModal.show()
    },
    hide () {
      this.$refs.baseModal.hide()
    },
    forward () {
      this.submitting = true
      Promise.all(this.selectedChatIds.map((id) => {
        const chat = this.filteredChatsById[id]
        const { chatId } = chat
        const type = chatId.startsWith('G-')
          ? 'group'
          : chatId.startsWith('B-')
            ? 'broadcast'
            : 'chat'

        const payload = {
          fromProfileId: this.$auth.user._id,
          content: this.message.content,
          chatId,
          frontId: this.message.frontId || Date.now() + '-' + (Math.floor(Math.random() * 1000)),
          createdAt: new Date(),
          updatedAt: new Date()
        }

        if (type === 'chat') {
          payload.toProfileId = chat.profileId
        } else if (type === 'group') {
          payload.groupId = chat._id
          payload.toProfileIds = chat.members.map(({ _id }) => _id)
        }

        return this.$repos.chatRepo.sendMessage(payload, type)
      }))
        .then(() => {
          this.submitting = false
          this.$refs.baseModal.hide()
        })
    }
  }
}
</script>

<style lang="postcss" scoped>
input[type="checkbox"] {
  & ~ .check-indicator {
    @apply relative w-6 h-6 rounded-full border-2 border-black border-opacity-50;
  }

  &:checked ~ .check-indicator {
    background-color: #86cf9e;
    border-color: #86cf9e;

    &::after {
      position: absolute;
      content: '';
      left: 50%;
      top: 50%;
      width: 7px;
      height: 12px;
      border-style: solid;
      border-width: 0 2px 2px 0;
      border-color: #fff;
      transform: translate(-50%, -60%) rotate(45deg);
    }
  }
}
</style>
