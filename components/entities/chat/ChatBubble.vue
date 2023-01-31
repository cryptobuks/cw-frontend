<template>
  <div :id="source.frontId" class="relative w-full my-1" :type="contentType">
    <div v-if="source._dateChanged" class="flex justify-center my-3">
      <div class="bg-gray-800 bg-opacity-50 text-white px-5 py-2 rounded-lg text-sm">
        {{ $utils.getHumanDate(source.createdAt) }}
      </div>
    </div>
    <div class="flex" :class="[source.fromProfileId === $auth.user._id ? 'justify-end' : 'justify-start', source._tail ? 'mt-2' : null]">
      <div class="base-chat-bubble__wrapper">
        <!-- TODO: Conditionally apply `sent` or `received` class to switch bubble styles. -->
        <div
          v-click-away="onBubbleClickAway"
          class="base-chat-bubble group"
          :class="
            [source.fromProfileId === $auth.user._id ? 'sent' : 'received',
             source._tail ? 'tail' : null,
             source.reactions && source.reactions.length > 0 ? 'pb-2' : 'pb-1'
            ]"
          :style="{ maxWidth: hasImage ? '368px' : null }"
          @click="onBubbleClick"
          @mouseover="active = true"
        >
          <div class="absolute right-0 mr-2 z-10" style="mix-blend-mode: difference">
            <!-- only activate if the bubble has been clicked or moused over to optimize load/scrolling -->
            <cw-actions-popover
              v-if="active"
              ref="actionsPopover"
              :source="source"
              :persist-actions-btn="persistActionsBtn"
              @active-change="persistActionsBtn = $event"
            />
          </div>
          <div v-if="!!senderName" class="sender-name pl-2 pr-6 py-1">
            {{ senderName }}
          </div>
          <cw-bubble-reply-quote v-if="source.replyToMessageId" :message-id="source.replyToMessageId" />
          <cw-chat-image-content v-if="hasImage" :source="source" :style="{ marginTop: senderName ? null : '30px' }" @click="showImageModal" />
          <cw-chat-file-content v-if="contentType === 'file'" :source="source" />
          <cw-chat-text-content v-if="contentType !== 'email' && source.content.text" :source="source" />
          <cw-chat-audio-content v-if="contentType === 'audio'" :source="source" />
          <cw-chat-email-content v-if="contentType === 'email'" :source="source" />
          <cw-chat-message-timestamp-ticks v-if="!source.content.text" class="mt-1 ml-2" :source="source" />
          <cw-special-message-actions
            v-if="contentType === 'action' && relevantActions.length"
            class="mt-2 -mx-1"
            :class="[source.reactions && source.reactions.length > 0 ? '-mb-2' : '-mb-1']"
            :actions="relevantActions"
            :message-id="source._id"
          />
          <cw-chat-bubble-statistics v-if="currentChat.type === 'broadcast'" :source="source" />
        </div>
        <div v-if="source.reactions && source.reactions.length" class="reactions">
          <div v-for="reaction in source.reactions" :key="reaction.reactionId" class="flex-shrink-0">
            <img :src="require(`~/assets/icons/reactions/${findReactionImageFromId(reaction.reactionId)}`)">
          </div>
        </div>
      </div>
      <base-popover v-if="reactions && source.fromProfileId !== $auth.user._id" ref="reactionsPopover" :offset-x="-100" :mount-on-focus="true" placement="auto">
        <template #activator>
          <button class="react-btn text-white focus:outline-none w-4 h-4 ml-2">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <g transform="translate(1 1)" fill="none" fill-rule="evenodd">
                <path class="stroke-current fill-current" d="M9.32 10.842a1.739 1.739 0 113.477 0 1.739 1.739 0 01-3.477 0zm7.883 0a1.74 1.74 0 113.479.002 1.74 1.74 0 01-3.48-.002zm5.58 8.281c-1.323 2.828-4.422 4.656-7.894 4.656-3.547 0-6.664-1.837-7.941-4.68-.22-.486.03-1.045.557-1.247.13-.05.264-.073.396-.073.405 0 .79.22.954.588.957 2.128 3.325 3.502 6.034 3.502 2.648 0 5.002-1.375 5.998-3.504.226-.484.835-.707 1.358-.497.523.21.765.771.538 1.255z" stroke-width="1.5" fill-rule="nonzero" />
                <circle class="stroke-current" stroke-width="2.5" cx="15" cy="15" r="15" />
              </g>
            </svg>
          </button>
        </template>

        <div class="flex items-center space-x-2 bg-black bg-opacity-95 rounded-xl p-4">
          <button
            v-for="reaction in reactions"
            :key="reaction.id"
            class=" w-10 h-10 transform transition-transform duration-150 focus:outline-none hover:scale-110"
            :class="{'reaction-active': reactionIsAlreadyUsed(reaction.id)}"
            @click="toggleReaction(reaction.id)"
          >
            <img :src="require(`~/assets/icons/reactions/${reaction.image}`)">
          </button>
        </div>
      </base-popover>
    </div>

    <!-- view image modal for messages of type "image" -->
    <div v-if="contentType === 'image'" v-show="isImageModalShown" class="fixed inset-0 flex flex-col bg-white bg-opacity-75" style="z-index: 1000">
      <div class="flex self-end mt-2 mr-5">
        <a :href="$utils.getFileUrl(source.content.imageId, source.content.filename)" :download="source.content.filename"><img src="~assets/icons/export.svg"></a>
        <button class="focus:outline-none ml-5" @click="isImageModalShown = false">
          <img src="~assets/icons/dismiss.svg">
        </button>
      </div>
      <div class="flex justify-center items-center flex-1" style="height: calc(100vh - 70px)">
        <img :src="$utils.getFileUrl(source.content.imageId, source.content.filename)" style="max-height: 90%">
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    index: {
      type: Number,
      default () { return -1 }
    },
    source: {
      type: Object,
      default () {
        return {}
      }
    },
    currentChat: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      active: false, // bubble becomes active when moused over or clicked
      isScrolling: null,
      sendingQueue: null,
      persistActionsBtn: false,
      isImageModalShown: false,
      chatMessagesContainer: null
    }
  },

  computed: {
    isMobileOrTablet () {
      return ['mobile', 'tablet'].includes(this.$mq)
    },

    reactions () {
      return this.$store.state.chat.availableReactions
    },

    hasImage () {
      const { imageId, filename } = this.source.content
      return imageId && filename
    },

    relevantActions () {
      return this.source.content.actions.filter(action =>
        (action.showTo?.includes('to') && this.source.toProfileId === this.$auth.user._id) ||
        (action.showTo?.includes('from') && this.source.fromProfileId === this.$auth.user._id)
      )
    },

    contentType () {
      return this.source?.content?.type
    },

    profile () {
      if (!this.source.fromProfileId) {
        return null
      }
      return this.$store.getters['chat/getFriend'](this.source.fromProfileId)
    },

    manager () {
      if (!this.source.fromManagerProfileId) {
        return null
      }
      return this.$store.getters['chat/getFriend'](this.source.fromManagerProfileId)
    },

    senderName () {
      if (this.$auth.isBusiness() && this.currentChat.type === 'group' && this.profile) {
        return this.manager && this.manager.displayName !== this.profile.displayName && this.source.fromProfileId === this.$auth.user._id ? `${this.profile.displayName} - ${this.manager.displayName}` : this.profile.displayName
      } else if (
        (this.$auth.isBusiness() && this.currentChat.type !== 'group' && this.source.fromProfileId === this.$auth.user._id && this.profile && this.manager) ||
        (this.$auth.isUser() && this.currentChat.type === 'chat' && this.source.toProfileId === this.$auth.user._id && this.profile && this.manager)
      ) {
        return this.manager.displayName
      } else if (this.$auth.isUser() && this.currentChat.type === 'group' && this.profile) {
        return this.profile.displayName
      }

      return ''
    }
  },

  created () {
    this.$store.dispatch('chat/getFriend', this.source.fromProfileId)
    if (this.source.fromManagerProfileId) {
      this.$store.dispatch('chat/getFriend', this.source.fromManagerProfileId)
    }
  },

  methods: {
    onBubbleClick () {
      this.active = true
      if (this.isMobileOrTablet) {
        this.persistActionsBtn = true
      }
    },

    onBubbleClickAway () {
      this.persistActionsBtn = false
    },

    closeReactionsPopover () {
      if (!this.$refs.reactionsPopover) { return }
      this.$refs.reactionsPopover.hide()
    },

    closeActionsPopover () {
      if (!this.$refs.actionsPopover) { return }
      this.$refs.actionsPopover.hide()
    },

    handleScroll () {
      this.closeReactionsPopover()
      this.closeActionsPopover()
    },

    toggleReaction (reactionId) {
      let action = 'chat/setMessageReaction'
      if (this.reactionIsAlreadyUsed(reactionId)) {
        action = 'chat/deleteMessageReaction'
      }

      this.$store.dispatch(action, {
        messageId: this.source._id,
        reactionId
      })

      this.closeReactionsPopover()
    },

    findReactionImageFromId (reactionId) {
      const reaction = this.reactions.find((reaction) => {
        return reaction.id === reactionId
      })
      return reaction.image || ''
    },

    reactionIsAlreadyUsed (reactionId) {
      if (!this.source?.reactions?.length) { return false }
      const reaction = this.source.reactions.find((reaction) => {
        return reaction.reactionId === reactionId
      })
      return !!reaction
    },

    showImageModal () {
      this.isImageModalShown = true
      this.$repos.chatRepo.setMessageClick({ messageId: this.source._id, type: 'image' })
    }
  }
}
</script>

<style lang="scss" scoped>
.base-chat-bubble__wrapper {
  max-width: 80%;
  @apply flex flex-col relative;
}

.base-chat-bubble {
  min-width: 96px;
  max-width: 800px;
  font-size: 0.90rem;
  @apply relative rounded-lg shadow-md px-1 pt-1;

  &.sent {
    margin-right: 10px;
    background-color: rgba(#e5f2dd, 0.95);

    & .quote {
      @apply bg-white bg-opacity-95;
    }

    &.tail {
      @apply rounded-tr-none;

      &::before {
        @apply absolute w-0 h-0 top-0;
        content: '';
        left: 100%;
        border-width: 0px 0px 10px 10px;
        border-color: transparent transparent transparent rgba(#e5f2dd, 0.95);
      }
    }
  }

  &.received {
    margin-left: 10px;
    @apply bg-white bg-opacity-90;

    & .quote {
      background-color: rgba(#e5f2dd, 0.95);
    }

    &.tail {
      @apply rounded-tl-none;

      &::before {
        @apply absolute w-0 h-0 top-0;
        content: '';
        right: 100%;
        border-width: 0px 10px 10px 0;
        border-color: transparent rgba(#fff, 0.9) transparent transparent;
      }
    }
  }
}

.reactions {
  margin-top: -13px;
  @apply flex flex-wrap px-4 z-10;

  img {
    height: 26px;
    @apply mr-1;
  }
}

.base-name {
  @apply block font-bold;
}

.sender-name {
  @apply base-name text-sm text-cw-red;
}

.sent + .v-popover {
  @apply hidden;
}
</style>

<style>
/* MESSAGE REACTIONS POPOVER STYLES */
/* .reactions-base.tooltip {
  & .popover-inner {
    @apply bg-black bg-opacity-95 rounded-xl p-4;

    & button {
      @apply w-10 h-10 transition-transform duration-150;

      &:focus {
        @apply outline-none;
      }

      &:hover {
        @apply transform scale-110;
      }
    }
  }

  & .popover-arrow {
    @apply hidden;
  }

  & .active::after {
    content: "";
    @apply block w-2 h-2 rounded-full bg-green mx-auto my-1;
  }
} */

.reaction-active::after {
    content: "";
    @apply block w-2 h-2 rounded-full bg-green mx-auto my-1;
  }

/* MESSAGE LINK */
.message-link {
  text-decoration: none !important;
  @apply text-blue;
}
</style>
