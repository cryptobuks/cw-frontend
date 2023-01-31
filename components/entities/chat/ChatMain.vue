<template>
  <base-main-cards-wrapper class="relative">
    <!-- Left column -->
    <base-main-card
      v-show="
        !isSmallScreen ||
          (!viewingProfileId && ($mq === 'mobile' || isMobileChatListShown))
      "
      :title="$t('chat.messages')"
      hide-search
      no-border
      body-class="bg-gray-150 bg-opacity-90"
      class="lg:w-1/3 xl:w-7/25 flex-shrink-0 absolute md:static inset-0 z-30 transform transition-transform duration-300"
      :class="{ '-translate-x-full': isSmallScreen && !isMobileChatListShown }"
      :actions="actions"
    >
      <cw-group-modal ref="groupModal" />
      <cw-broadcast-modal v-if="mode === 'broadcast'" ref="broadcastModal" />
      <cw-new-profile-modal ref="profileModal" />

      <cw-forward-modal ref="forwardModal" :message-id="forwardMessageId" />

      <div class="flex flex-col w-full h-full">
        <div
          class="w-full h-full max-h-screen overflow-hidden transition-max-height duration-300"
          :style="{ maxHeight: mode === 'broadcast' ? 0 : null }"
        >
          <cw-chat-global-search />
          <base-scroll class="chats-list">
            <template
              v-if="(mode === 'chat' || mode === 'group') && chats.length"
            >
              <h4 v-if="searchActive" class="chat-list-section-title">
                {{ $t("chat.chats") }}
              </h4>
              <template
                v-for="chat in chats.filter((e) => e.type !== 'broadcast')"
              >
                <cw-chat-tease
                  :key="chat._id"
                  :chat="chat"
                  :is-active="chatIsActive(chat)"
                  @click.native="handleClickChatTease(chat)"
                />
                <!-- <cw-group-tease v-else-if="chat._type === 'group'" :key="chat._id" :group="chat" @click.native="handleClickGroupTease(chat)" /> -->
              </template>
            </template>
            <template v-if="searchActive && searchMessages.length">
              <h4 class="chat-list-section-title">
                {{ $t("chat.messages") }}
              </h4>
              <cw-chat-global-search-message-tease
                v-for="message in searchMessages"
                :key="message.frontId"
                :message="message"
                @click.native="goToMessage(message)"
              />
            </template>
          </base-scroll>
        </div>

        <template v-if="hasAccessToBroadcasts">
          <base-transition :active="true">
            <button
              v-if="mode === 'chat' || mode === 'group'"
              class="switch-mode-button"
              @click="showBroadcastList"
            >
              <span class="font-poppins-medium font-medium text-xl">{{
                $t("chat.chat_list.broadcast")
              }}</span>
              <svg
                class="stroke-current ml-3 mb-1 flex-shrink-0"
                viewBox="0 0 32 33"
                xmlns="http://www.w3.org/2000/svg"
                style="width: 16px; height: 17px"
              >
                <g
                  stroke-width="3"
                  fill="none"
                  fill-rule="evenodd"
                  stroke-linecap="round"
                >
                  <path d="M15.697 32V2.04M1 18.8L15.697 2.04l15 16.76" />
                </g>
              </svg>
            </button>
            <button v-else class="switch-mode-button" @click="showContactsList">
              <span class="font-poppins-medium font-medium text-xl">{{
                $t("chat.chat_list.contacts")
              }}</span>
              <svg
                class="stroke-current ml-3 mt-1 flex-shrink-0"
                viewBox="0 0 32 33"
                xmlns="http://www.w3.org/2000/svg"
                style="width: 16px; height: 17px"
              >
                <g
                  stroke-width="3"
                  fill="none"
                  fill-rule="evenodd"
                  stroke-linecap="round"
                >
                  <path d="M16.303 1v29.96M31 14.2L16.303 30.96l-15-16.76" />
                </g>
              </svg>
            </button>
          </base-transition>
        </template>

        <div
          class="w-full h-full max-h-screen overflow-hidden transition-max-height duration-300"
          :style="{ maxHeight: mode !== 'broadcast' ? 0 : null }"
        >
          <base-scroll class="w-full h-full">
            <template v-if="mode === 'broadcast' && chats.length && chats.find((e) => e.type === 'broadcast')">
              <cw-broadcast-list-item
                v-for="broadcast in broadcasts"
                :key="broadcast._id"
                :source="broadcast"
                @click.native="setCurrentChat(broadcast)"
              />
            </template>
          </base-scroll>
        </div>
      </div>
    </base-main-card>

    <!-- Middle column -->
    <base-main-card
      v-show="
        !isSmallScreen ||
          (!(viewingProfileId || isGroupCardShown || isBroadcastCardShown) &&
            !isMobileChatListShown)
      "
      hide-search
      :show-back-button="isSmallScreen"
      :actions="
        !currentChat || viewingProfileId || searchInChatSidebarOpen
          ? []
          : [{ icon: 'search', handler: toggleSearchInChatSidebar }]
      "
      class="lg:border-l lg:border-r border-gray-300 flex-grow w-full"
      @back="chatCardBack"
    >
      <template v-if="currentChat" #title-text>
        <div
          v-if="currentChat.type === 'chat'"
          class="flex-grow flex items-center cursor-pointer"
          @click="!(currentChat.chatId).startsWith('S-') ? viewProfile(currentChat.profileId) : null"
        >
          <cw-profile-avatar
            :src="$utils.getAvatarUrl(currentChat.avatar, (currentChat.chatId).startsWith('S-') ? 'system' : currentChat.type)"
            :size="12"
            :is-online="friends[currentChat.profileId] && friends[currentChat.profileId].status"
          />

          <div class="flex flex-col px-3">
            <p class="text-xl leading-tight">
              {{ currentChat.displayName }}
            </p>

            <p v-if="!(currentChat.chatId).startsWith('S-')" class="text-sm leading-tight text-gray-600">
              <span v-if="friends[currentChat.profileId] && friends[currentChat.profileId].status">
                {{ $t("chat.profile_online") }}
              </span>

              <span v-else>
                <!-- Here go format in human tipe -->
                {{ lastUpdate }}
              </span>
            </p>
          </div>
        </div>

        <div
          v-else-if="currentChat.type === 'group'"
          class="flex-grow flex items-center cursor-pointer"
          @click="isGroupCardShown = !isGroupCardShown"
        >
          <cw-profile-avatar
            :src="
              $utils.getAvatarUrl(currentChat.avatar, 'group')
            "
            :alt="currentChat.displayName"
            :size="12"
            :is-group="true"
          />

          <div class="flex flex-col ml-3">
            <div class="flex items-center">
              <span class="text-xl">
                {{ currentChat.displayName }}
              </span>
              <base-icon
                class="text-black text-opacity-50 ml-2"
                name="person"
                :size="20"
              />
              <span class="text-sm text-black text-opacity-50 ml-1">{{
                currentGroupMembers.length
              }}</span>
            </div>
            <div class="text-sm leading-tight text-gray-600">
              {{ currentGroupMemberNames }}
            </div>
          </div>
        </div>

        <div
          v-else-if="currentChat.type === 'broadcast'"
          class="flex-grow flex items-center cursor-pointer"
          @click="isBroadcastCardShown = !isBroadcastCardShown"
        >
          <cw-profile-avatar
            :src="
              $utils.getAvatarUrl(currentChat.avatar, 'group')
            "
            :alt="currentChat.displayName"
            :size="12"
            :is-group="true"
          />

          <div class="flex flex-col ml-3">
            <div class="flex items-center">
              <span class="text-xl">
                {{ currentChat.displayName }}
              </span>
              <base-icon
                class="text-black text-opacity-50 ml-2"
                name="person"
                :size="20"
              />
              <!-- TODO: We need to get the correct number of potential recepients -->
              <span class="text-sm text-black text-opacity-50 ml-1">
                {{ (currentChat.filter && currentChat.filter.profiles && currentChat.filter.profiles.length) || 0 }}
              </span>
            </div>
            <div class="text-xs text-black text-opacity-50">
              {{ currentBroadcastRecepientNames }}
            </div>
          </div>
        </div>
      </template>

      <template #default>
        <virtual-list
          ref="messageList"
          class="message-list scroll-touch"
          :class="{ overflow: overflow }"
          :data-key="'frontId'"
          :data-sources="messages"
          :data-component="messageComponent"
          :extra-props="{ currentChat }"
          :item-class="'message-item'"
          :keeps="30"
          :estimate-size="130"
          :top-threshold="400"
          :bottom-threshold="200"
          @resized="handleResize"
          @totop="handleToTop"
          @tobottom="handleToBottom"
          @scroll="handleScroll"
        >
          <div slot="header" class="flex justify-center">
            <base-spinner
              v-if="
                loadingOldestMessages &&
                  currentChat &&
                  messages.length &&
                  currentChat.firstMessage &&
                  currentChat.firstMessage.frontId !== messages[0].frontId
              "
              size="sm"
              class="block h-10"
            />
          </div>
          <div slot="footer" class="flex justify-center">
            <base-spinner
              v-if="
                loadingLatestMessages &&
                  currentChat &&
                  messages.length &&
                  currentChat.lastMessage &&
                  currentChat.lastMessage.frontId !== messages[messages.length - 1].frontId
              "
              size="sm"
              class="block h-10"
            />
          </div>
        </virtual-list>

        <portal-target name="chat-image-upload-preview-target" />

        <transition name="fade">
          <div
            v-if="currentChat && messages.length"
            v-show="!scrollIsAtTheBottom"
            class="btn-scroll-down sticky cursor-pointer"
            @click="goToBottomOfChat"
          >
            <div
              class="w-6 h-6 flex items-center justify-center rounded-full border-2 border-black"
            >
              <base-icon name="chevron-down" />
            </div>
          </div>
        </transition>
      </template>

      <template #footer>
        <cw-chat-input
          v-if="currentChat && !(currentChat.chatId).startsWith('S-') && isInputShown"
          ref="input"
          :minify="!!(viewingProfileId || searchInChatSidebarOpen || isGroupCardShown || isBroadcastCardShown)"
          @send="goToBottomOfChat"
        />
      </template>
    </base-main-card>

    <!-- Right column -->
    <nuxt-child
      v-if="viewingProfileId"
      no-border
      show-search-toggler
      class="lg:w-1/3 xl:w-7/25 flex-shrink-0"
    />
    <cw-search-in-chat-card
      v-if="searchInChatSidebarOpen"
      no-border
      class="lg:w-1/3 xl:w-7/25 flex-shrink-0"
      :current-chat="currentChat"
      @close="toggleSearchInChatSidebar"
      @messageclick="goToMessage"
    />
    <cw-group-card
      v-if="isGroupCardShown"
      class="lg:w-1/3 xl:w-7/25 flex-shrink-0"
      :hide-edit-button="currentChat.ownerId === $auth.user._id"
      no-border
      @edit="showGroupModal(currentChat)"
      @dismiss="isGroupCardShown = false"
    />
    <cw-broadcast-card
      v-if="isBroadcastCardShown"
      class="lg:w-1/3 xl:w-7/25 flex-shrink-0"
      no-border
      @edit="showBroadcastModal(currentChat)"
      @dismiss="isBroadcastCardShown = false"
    />
  </base-main-cards-wrapper>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'
import ChatBubble from './ChatBubble'

export default {
  name: 'ChatMain',

  components: {
    VirtualList: () => import('vue-virtual-scroll-list')
  },

  data () {
    return {
      isMobileChatListShown: true,
      messageComponent: ChatBubble,
      overflow: false,
      scrollIsAtTheBottom: true,
      loadingNewMessages: false,
      searchActive: false,
      searchInChatSidebarOpen: false,
      isGroupCardShown: false,
      isBroadcastCardShown: false,
      loadingOldestMessages: false,
      loadingLatestMessages: false,
      businessChatsSortCounter: 1 // a counter that's incremented every minute to force the chats sorter to recompute
    }
  },

  computed: {
    ...mapState('chat', ['mode', 'currentChat']),
    ...mapGetters('chat', {
      getChat: 'getChat',
      getMessagesOrderedByCreatedAt: 'getMessagesOrderedByCreatedAt',
      searchMessages: 'getSearchMessagesOrderedByCreatedAt',
      currentBroadcastRecepients: 'getCurrentBroadcastRecepients'
    }),

    sortedChats () {
      return this.$auth.isBusiness()
        // forcing re-sorting on counter increment (every 1 min) for business chats
        ? this.businessChatsSortCounter && this.$store.getters['chat/getBusinessChatsSorted'](this.$auth._id)
        : this.$store.getters['chat/getUserChatsSorted']
    },

    actions () {
      if (this.$auth.isUser()) {
        return null
      }
      const actions =
        this.mode === 'broadcast'
          ? [
            {
              icon: 'broadcast',
              tooltip: this.$t('chat.actions.create_broadcast'),
              handler: () => this.showBroadcastModal()
            }
          ]
          : [
            {
              icon: 'person',
              tooltip: this.$t('chat.actions.create_individual'),
              handler: () => this.$refs.profileModal?.show?.({
                individual: true,
                params: [null, { hiddenFields: ['signature', 'documents', 'password'] }]
              })
            },
            this.canCreateGroups
              ? {
                icon: 'groups',
                tooltip: this.$t('chat.actions.create_group'),
                handler: () => this.showGroupModal()
              }
              : null
          ].filter(Boolean)

      return actions.map(action => ({ ...action, color: '#262626', size: 22 }))
    },

    chats () {
      return this.sortedChats
    },

    canCreateGroups () {
      return this.$auth.isBusiness() && !this.$auth.user.roles.includes('SP')
    },

    hasAccessToBroadcasts () {
      const roles = new Set(this.$auth.user.roles)
      return this.$auth.isBusiness() && (roles.has('DI') || roles.has('OP') || roles.has('SP'))
    },

    broadcasts () {
      let output = this.chats.filter(c => c.type === 'broadcast')

      const roles = new Set(this.$auth.user.roles)
      if (roles.has('SP') && !(roles.has('DI') || roles.has('OP'))) {
        output = output.filter(b => b.managedBy === this.$auth.user.loginUser)
      }

      return output
    },

    lastUpdate () {
      if (!this.currentChat?.profileId || typeof this.friends[this.currentChat.profileId]?.lastUpdate === 'undefined') {
        return ''
      }
      const last = new Date(
        this.friends[this.currentChat.profileId].lastUpdate
      )
      return this.$utils.getHumanDateTime(last)
    },

    friends () {
      return this.$store.state.chat.friends
    },

    messages () {
      const messages =
        this.getMessagesOrderedByCreatedAt(this.currentChat) || []
      if (this.currentChat?.type === 'broadcast') {
        messages?.map((m) => {
          // Forcing all broadcast messages to have a tail
          Object.defineProperty(m, '_tail', {
            configurable: true,
            get: () => true,
            set: () => {} // noop. `decorateMessages` can't reset this
          })

          return m
        })
      }
      return this.decorateMessages(messages)
    },

    isSmallScreen () {
      return this.$mq === 'tablet' || this.$mq === 'mobile'
    },

    forwardMessageId () {
      return this.currentChat?.forwardMessageId
    },

    currentGroupMembers () {
      return this.$store.getters['chat/getCurrentGroupMembers'](
        this.$auth.user
      )
    },

    currentGroupMemberNames () {
      return this.currentGroupMembers
        ?.map(m => m.displayName)
        .filter(Boolean)
        .join(', ')
    },

    currentBroadcastRecepientNames () {
      return this.currentBroadcastRecepients
        ?.map(m => m.displayName)
        .filter(Boolean)
        .join(', ')
    },

    isInputShown () {
      return !!this.currentChat
    },

    viewingProfileId: {
      get () {
        return this.$route.params?.profileId
      },
      set (newValue) {
        this.$route.params.profileId = newValue
      }
    }
  },

  watch: {
    chats: {
      async handler (val, oldVal) {
        const { cId, idMessage } = this.$route.query

        if (oldVal.length === 0 && cId) {
          const chat = this.getChat(cId)
          await this.setCurrentChat(chat)

          if (idMessage) {
            const messageIndex = this.messages.findIndex(m => m._id === idMessage)

            if (messageIndex !== -1) {
              // Poll scroll size in 0.5s intervals until it stabilizes then scroll to message
              let scrollSize
              const intervalId = window.setInterval(() => {
                if (this.$refs.messageList?.getScrollSize() === scrollSize) {
                  this.$refs.messageList.scrollToIndex(messageIndex)
                  window.clearInterval(intervalId)
                } else {
                  scrollSize = this.$refs.messageList?.getScrollSize()
                }
              }, 500)
            }
          }
        }
      },
      deep: true
    },

    currentChat: {
      handler (val) {
        this.handleResize()
        // this.setVirtualListToBottom()
      },
      deep: true
    },

    messages: {
      handler (val, oldVal) {
        const asNewElement =
          val.length &&
          oldVal.length &&
          val[val.length - 1].frontId !== oldVal[oldVal.length - 1].frontId

        // If first load or new element
        if (!oldVal || asNewElement) {
          if (val[val.length - 1].fromProfileId !== this.$auth.user._id) {
            this.setMessageView()
          }
          if (this.scrollIsAtTheBottom) {
            this.goToBottomOfChat()
          }
        }
      },
      deep: true
    },

    forwardMessageId (val) {
      if (val) {
        this.$refs.forwardModal.show()
      } else {
        this.$refs.forwardModal.hide()
      }
    },

    viewingProfileId (val) {
      if (val) {
        this.searchInChatSidebarOpen = false
        this.isGroupCardShown = false
        this.isBroadcastCardShown = false
      }
    },

    searchInChatSidebarOpen (val) {
      if (val) {
        this.viewingProfileId = false
        this.isGroupCardShown = false
        this.isBroadcastCardShown = false
      }
    },

    isGroupCardShown (val) {
      if (val) {
        this.viewingProfileId = false
        this.searchInChatSidebarOpen = false
        this.isBroadcastCardShown = false
      }
    },

    isBroadcastCardShown (val) {
      if (val) {
        this.viewingProfileId = false
        this.searchInChatSidebarOpen = false
        this.isGroupCardShown = false
      }
    }
  },

  mounted () {
    this.$nuxt.$on('chat:searchActive', (val) => {
      this.searchActive = val
    })

    if (this.$auth.isBusiness()) {
      const intervalId = window.setInterval(() => {
        this.businessChatsSortCounter++
      }, 60 * 1000)

      this.$on('hook:beforeDestroy', () => {
        window.clearInterval(intervalId)
      })
    }
  },

  methods: {
    ...mapMutations('linkPreview', {
      clearOldLinkPreview: 'CLEAR_OLD_LINK_PREVIEW'
    }),
    ...mapMutations('chat', {
      setChatMode: 'SET_CHAT_MODE'
    }),
    ...mapActions('chat', [
      'getFilterTarget',
      'getReactionsList',
      'loadChatsAndMessages'
    ]),

    decorateMessages (messages) {
      if (!messages || !messages.length) {
        return messages
      }
      // Pre-set if message has change of data and if is the first of multiple messages

      // Force on first element
      messages[0]._dateChanged = true
      messages[0]._tail = true

      for (let i = 1; i < messages.length; i++) {
        const pre = messages[i - 1]
        const cur = messages[i]
        const preDate = new Date(pre.createdAt)
        const curDate = new Date(cur.createdAt)
        messages[i]._dateChanged =
          preDate.getDate() !== curDate.getDate() ||
          preDate.getMonth() !== curDate.getMonth() ||
          preDate.getFullYear() !== curDate.getFullYear()
        messages[i]._tail = pre.fromProfileId !== cur.fromProfileId ||
          preDate.getDate() !== curDate.getDate()
      }
      return messages
    },

    showGroupModal (group) {
      this.$refs.groupModal?.show(group)
    },

    showBroadcastModal (broadcast) {
      this.$refs.broadcastModal?.show(broadcast)
    },

    chatIsActive (chat) {
      return !!(this.currentChat && this.currentChat._id === chat._id)
    },

    handleClickChatTease (chat) {
      this.viewingProfileId = false
      this.searchInChatSidebarOpen = false
      this.isGroupCardShown = false
      this.isBroadcastCardShown = false
      this.setCurrentChat(chat, true)
    },

    setCurrentChat (chat, toBottom = false) {
      if (this.currentChat?.chatId !== chat.chatId) {
        this.searchInChatSidebarOpen = false
      }

      return this.$store
        .dispatch('chat/loadMessages', {
          chatId: chat.chatId
        })
        .then(() => {
          this.isMobileChatListShown = false
          this.isGroupCardShown = false
          this.setChatMode(chat.type)
          this.$router.push({
            name: 'chat',
            query: {
              ...this.$route.query,
              cId: chat.chatId
            }
          })
          this.$store.dispatch('chat/setCurrentChat', chat)
          this.$nextTick(() => {
            this.setMessageView()
            if (toBottom) {
              this.setVirtualListToBottom()
            }
          })
        })
    },

    goToMessage (message) {
      this.loadingNewMessages = true
      const chat = this.$store.getters['chat/getChatFromMessage'](message)
      this.$store.dispatch('chat/clearChatMessages', chat)
      this.$store
        .dispatch('chat/loadSearchedMessages', {
          chatId: chat.chatId,
          searchedMessageId: message._id
        })
        .then(() => {
          if (this.currentChat?.chatId !== chat.chatId) {
            this.$store.dispatch('chat/setCurrentChat', chat)
          }
          const index = this.messages.findIndex(
            e => e.frontId === message.frontId
          )
          this.$nextTick(() => {
            this.setVirtualListToIndex(index)
            this.loadingNewMessages = false
          })
        })

      this.isMobileChatListShown = false
    },

    handleResize () {
      this.checkOverFlow()
    },

    handleScroll () {
      if (
        this.currentChat?.lastMessage?.frontId !==
          this.messages[this.messages.length - 1]?.frontId ||
        this.$refs?.messageList?.getOffset() <
          this.$refs?.messageList?.getScrollSize() -
            this.$refs?.messageList?.getClientSize()
      ) {
        this.scrollIsAtTheBottom = false
      } else {
        this.scrollIsAtTheBottom = true
      }
    },

    handleToTop () {
      if (
        this.loadingOldestMessages ||
        !this.messages.length ||
        !this.$refs.messageList ||
        this.currentChat?.firstMessage?.frontId === this.messages[0]?.frontId
      ) {
        return
      }
      this.loadingOldestMessages = true
      const oldLength = this.messages.length
      this.$store
        .dispatch('chat/loadOldestMessages', {
          toMessageId: this.messages[0]._id
        })
        .then(() => {
          this.$nextTick(() => {
            this.setVirtualListToIndex(this.messages.length - oldLength)
            this.loadingOldestMessages = false
          })
        })
    },

    handleToBottom () {
      if (
        this.loadingLatestMessages ||
        !this.messages.length ||
        !this.$refs.messageList ||
        this.currentChat?.lastMessage?.frontId === this.messages[this.messages.length - 1]?.frontId
      ) {
        return
      }
      this.loadingLatestMessages = true
      this.$store
        .dispatch('chat/loadLatestMessages', {
          fromMessageId: this.messages[this.messages.length - 1]._id
        })
        .then(() => {
          this.$nextTick(() => {
            this.loadingLatestMessages = false
          })
        })
    },

    goToBottomOfChat () {
      if (!this.scrollIsAtTheBottom) {
        this.$store
          .dispatch('chat/loadMessages', {
            chatId: this.currentChat.chatId
          })
      }
      this.$nextTick(() => {
        this.setVirtualListToBottom()
      })
    },

    setVirtualListToBottom () {
      if (!this.$refs.messageList) {
        return
      }
      const messageList = this.$refs.messageList
      messageList.scrollToBottom()
      setTimeout(() => {
        if (
          messageList.getOffset() + messageList.getClientSize() <
          messageList.getScrollSize()
        ) {
          this.$nextTick(() => {
            this.setVirtualListToBottom()
          })
        }
      }, 500)
    },

    setVirtualListToIndex (index) {
      if (!this.$refs.messageList) {
        return
      }
      this.$refs.messageList.scrollToIndex(index)
    },

    setVirtualListToOffset (offset) {
      if (!this.$refs.messageList) {
        return
      }
      this.$refs.messageList.scrollToOffset(offset)
    },

    checkOverFlow () {
      const messageList = this.$refs.messageList
      if (!messageList) {
        return
      }
      this.overflow = messageList.getScrollSize() > messageList.getClientSize()
    },

    setMessageView () {
      if (!this.messages) {
        return
      }
      const unviewedMessage = this.messages
        .slice()
        .reverse()
        .find((message) => {
          return (
            !message.isViewed && message.fromProfileId !== this.$auth.user._id
          )
        })
      if (!unviewedMessage) {
        return
      }
      this.$store.dispatch('chat/setMessageView', unviewedMessage)
    },

    toggleSearchInChatSidebar () {
      this.searchInChatSidebarOpen = !this.searchInChatSidebarOpen
      this.$store.dispatch('chat/clearSearchInChatMessages')
    },

    chatCardBack () {
      this.isMobileChatListShown = true
    },

    showBroadcastList () {
      this.isGroupCardShown = false
      this.setChatMode('broadcast')
    },

    showContactsList () {
      this.isBroadcastCardShown = false
      this.setChatMode('chat')
    },

    viewProfile (profileId) {
      if (profileId === this.$route.params.profileId) { return }
      this.$router.push(`/chat/${profileId}`)
    }
  },

  head () {
    return {
      title: this.$t('chat.messages')
    }
  }
}
</script>

<style lang="postcss">
.message-list {
  position: relative;
  width: 100%;
  height: 100%;
  scroll-behavior: auto;
  flex-direction: column-reverse;

  overflow-y: hidden;

  padding-left: 5px;
  padding-right: 5px;

  @apply py-3;

  @screen xs {
    padding-left: 5px;
    padding-right: 15px;

    @apply py-3;
  }

  &.overflow {
    display: block;
    flex-direction: column;

    &:hover {
      overflow-y: auto;
      padding-right: 5px;
    }
  }

  .message-item {
    display: flex;
    align-items: center;
  }

  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar:hover {
    width: 15px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-clip: padding-box;
    border: 2px solid transparent;
    border-radius: 10px;

    @apply bg-gray-400 bg-opacity-90;
  }

  &::-webkit-scrollbar-thumb:hover {
    width: 15px;
    background-clip: padding-box !important;
    border: 2px solid transparent !important;

    @apply bg-gray-500;
  }
}

.btn-scroll-down {
  bottom: 5rem;
  z-index: 20;
  position: absolute;
  display: inline-block;
  float: right;
  padding: 0.8rem;
  border-radius: 50%;
  transform: translateX(2px);
  right: 1.6rem;
  @apply bg-gray-150 bg-opacity-90;

  @screen sm {
    bottom: 2rem;
  }
}

.chats-list {
  max-height: calc(100% - 82px);
  @apply w-full h-full;
}

.chat-list-section-title {
  @apply text-cw-red font-bold uppercase py-3 px-3;
}

.switch-mode-button {
  height: 63px;
  @apply flex justify-center items-center flex-shrink-0 text-cw-red border-t border-b border-gray-750 border-opacity-25;

  &:focus {
    @apply outline-none;
  }
}
</style>
