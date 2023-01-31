/* eslint prefer-const: ["error", {"destructuring": "all"}] */
import FilterMixin from '@/mixins/FilterMixin'

export const state = () => ({
  mode: 'chat',
  chats: [],
  messages: {},
  globalCountNotReaded: 0,
  filterTarget: null,
  // pendingMessages: [],
  friends: {},
  availableReactions: [],
  // to remove
  currentChat: null,
  drafts: {},
  emptyDraft: {
    type: 'text',
    text: ''
  },
  searchInChatQuery: '',
  globalSearchQuery: '',
  searchChats: [],
  searchMessages: [],
  searchInChatMessages: []
})

export const getters = {
  getBusinessChatsSorted: state => (userId) => {
    let chats = state.chats
    if (state.globalSearchQuery.length > 0) {
      chats = state.searchChats
    }

    const getOrderingScore = (chat) => {
      const { lastMessage, typeCode } = chat

      if (!lastMessage) {
        return Infinity
      }

      let { channel, createdAt } = lastMessage

      const minutesElapsed = Math.round((Date.now() - new Date(createdAt).getTime()) / (60 * 1000))

      if (['CH', 'CW', 'CU'].includes(typeCode)) {
        channel = 'cw'
      }

      const isViewed = ((chat.type === 'chat' && lastMessage.toProfileId === userId) || (chat.type !== 'chat' && lastMessage.toProfileIds.includes(userId) && lastMessage.fromManagerProfileId !== userId && lastMessage.fromProfileId !== userId)) && lastMessage.isViewed
      const isManaged = ((chat.type === 'chat' && lastMessage.toProfileId === userId) || (chat.type !== 'chat' && lastMessage.toProfileIds.includes(userId) && lastMessage.fromManagerProfileId !== userId && lastMessage.fromProfileId !== userId)) && lastMessage.isManaged

      let blockScore

      switch (channel) {
        case 'chat':
        case 'email':
        case 'group':
        case 'system':
          if (minutesElapsed < 36 * 60) {
            if (isViewed && !isManaged) {
              blockScore = 2
            } else if (!isViewed) {
              blockScore = 3
            } else {
              blockScore = 4
            }
          } else {
            blockScore = 5
          }
          break

        case 'plugin':
          if (minutesElapsed < 5) {
            blockScore = 1
          } else if (minutesElapsed < 36 * 60) {
            if (isViewed && !isManaged) {
              blockScore = 2
            } else if (!isViewed) {
              blockScore = 3
            } else {
              blockScore = 4
            }
          } else {
            blockScore = 5
          }
          break

        case 'ask':
        case 'book':
        case 'device':
          if (minutesElapsed < 1 * 60) {
            blockScore = 1
          } else if (minutesElapsed < 36 * 60) {
            if (isViewed && !isManaged) {
              blockScore = 2
            } else if (!isViewed) {
              blockScore = 3
            } else {
              blockScore = 4
            }
          } else {
            blockScore = 5
          }
          break

        case 'cw':
          if (minutesElapsed < 2 * 60) {
            blockScore = 1
          } else if (minutesElapsed < 36 * 60) {
            if (isViewed && !isManaged) {
              blockScore = 2
            } else if (!isViewed) {
              blockScore = 3
            } else {
              blockScore = 4
            }
          } else {
            blockScore = 5
          }
          break
      }

      const channelScores = {
        chat: 1,
        email: 1,
        group: 1,
        system: 1,
        plugin: 2,
        ask: 3,
        book: 3,
        device: 3,
        cw: 4
      }

      const channelScore = channelScores[channel]

      const statusScore =
        blockScore === 1
          ? isViewed && !isManaged
            ? 1
            : !isViewed ? 2 : 3
          : 0

      return blockScore * 1000 + channelScore * 100 + statusScore * 10 + (Date.now() - new Date(createdAt).getTime()) / Date.now()
    }

    return chats.slice().sort((a, b) => {
      return getOrderingScore(a) - getOrderingScore(b)
    })
  },

  getUserChatsSorted: (state) => {
    // TODO: test of simple order by updatedAt
    let chats = state.chats
    if (state.globalSearchQuery.length > 0) {
      chats = state.searchChats
    }
    return chats.slice().sort((a, b) => {
      a = a?.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt) : new Date(a.createdAt)
      b = b?.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt) : new Date(b.createdAt)
      return b - a
    })
  },

  getChat: state => (chatId) => {
    return state.chats.find((chat) => {
      return chat.chatId === chatId
    })
  },

  getChatFromMessage: state => (message) => {
    return state.chats.find((chat) => {
      return chat.chatId === message.chatId
    }) || state.searchChats.find((chat) => {
      return chat.chatId === message.chatId
    })
  },

  getFriendFromMessage: state => (message) => {
    return state.friends[message.fromManagerProfileId] || state.friends[message.fromProfileId]
  },

  getMessagesOrderedByCreatedAt: state => (chat) => {
    if (!chat || !state.messages[chat.chatId]) { return [] }
    // messages are already sorted when making the set
    // remove message deleted

    return state.messages[chat.chatId].filter(e => !e.isDeleted)
  },

  getReceivedMessagesOrderedByCreatedAt: (state, getters) => (chat) => {
    return getters.getMessagesOrderedByCreatedAt(chat).filter((m) => {
      return m.fromProfileId === chat.profileId
    })
  },
  getSendedMessagesOrderedByCreatedAt: (state, getters) => (chat) => {
    return getters.getMessagesOrderedByCreatedAt(chat).filter((m) => {
      return m.toProfileId === chat.profileId
    })
  },
  countMessagesNotManagedAndNotReaded: (state, getters) => (chat, auth) => {
    const ret = { notManaged: 0, notViewed: 0 }
    const chatId = chat?.chatId
    if (!chatId || !state.messages[chatId]) { return ret }

    state.messages[chatId].forEach((msg) => {
      const chat = getters.getChatFromMessage(msg)
      if (msg.chatId === chatId && ((chat.type === 'chat' && msg.toProfileId === auth.user._id) || (chat.type !== 'chat' && msg.toProfileIds.includes(auth.user._id) && msg.fromManagerProfileId !== auth.user._id && msg.fromProfileId !== auth.user._id)) && !msg.isViewed) {
        ret.notViewed++
      }
      if (msg.chatId === chatId && ((chat.type === 'chat' && msg.toProfileId === auth.user._id) || (chat.type !== 'chat' && msg.toProfileIds.includes(auth.user._id) && msg.fromManagerProfileId !== auth.user._id && msg.fromProfileId !== auth.user._id)) && !msg.isManaged) {
        ret.notManaged++
      }
    })
    return ret
  },

  getCurrentDraft (state) {
    return state.drafts[state.currentChat?.chatId] || state.emptyDraft
  },

  getCountMessagesNotReaded: (state, getters) => (auth) => {
    let notViewed = 0
    for (const chatId in state.messages) {
      const messages = state.messages[chatId]
      messages.forEach((msg) => {
        const chat = getters.getChatFromMessage(msg)
        if (
          chat &&
          msg.chatId === chatId &&
          !msg.isViewed &&
          (
            (
              chat.type === 'chat' &&
              msg.toProfileId === auth.user?._id
            ) ||
            (
              chat.type !== 'chat' &&
              msg.toProfileIds.includes(auth.user?._id) &&
              msg.fromManagerProfileId !== auth.user?._id &&
              msg.fromProfileId !== auth.user?._id
            )
          )
        ) {
          notViewed++
        }
      })
    }
    return notViewed
  },

  getSearchInChatQuery: (state) => {
    return state.searchInChatQuery
  },

  getGlobalSearchQuery: (state) => {
    return state.globalSearchQuery
  },

  getSearchMessagesOrderedByCreatedAt: (state) => {
    return state.searchMessages.slice().sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    }).filter(e => !e.isDeleted)
  },

  getSearchInChatMessagesOrderedByCreatedAt: (state) => {
    return state.searchInChatMessages.slice().sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    }).filter(e => !e.isDeleted)
  },

  getCurrentGroupMembers: state => (currentUser) => {
    if (state.currentChat && state.currentChat.members) {
      return state.currentChat.members.map((m) => {
        const member = { ...m }
        if (state.friends[m.profileId]) {
          member.displayName = state.friends[m.profileId].displayName
        } else if (m.profileId === currentUser._id) {
          member.displayName = currentUser.displayName
        }
        return member
      })
    } else {
      return []
    }
  },

  // TODO: We need a better way of getting this
  getCurrentBroadcastRecepients: (state) => {
    if (state.currentChat && state.currentChat.profiles) {
      const { filterTags } = FilterMixin.computed
      return filterTags.call({
        source: state.currentChat,
        filterTarget: state.filterTarget,
        normalizeFilter: FilterMixin.methods.normalizeFilter
      })
        .filter(t => t.value.type === 'profile')
        .map(({ id, text }) => ({ _id: id, displayName: text }))
    } else {
      return []
    }
  },

  getFriend: state => (friendId) => {
    return state.friends[friendId] || null
  }
}

export const mutations = {
  REFRESH_STORE (state) {
    this._vm.$set(state, 'mode', 'chat')
    this._vm.$set(state, 'chats', [])
    this._vm.$set(state, 'messages', {})
    this._vm.$set(state, 'globalCountNotReaded', 0)
    this._vm.$set(state, 'filterTarget', null)
    this._vm.$set(state, 'friends', {})
    this._vm.$set(state, 'availableReactions', [])
    this._vm.$set(state, 'currentChat', null)
    this._vm.$set(state, 'drafts', {})
    this._vm.$set(state, 'emptyDraft', {
      type: 'text',
      text: ''
    })
    this._vm.$set(state, 'searchInChatQuery', '')
    this._vm.$set(state, 'globalSearchQuery', '')
    this._vm.$set(state, 'searchChats', [])
    this._vm.$set(state, 'searchMessages', [])
    this._vm.$set(state, 'searchInChatMessages', [])
  },

  SET_CHAT_MODE (state, val) {
    state.currentChat = null
    state.mode = val
  },

  SET_CHATS_LIST (state, val) {
    const profileIds = []

    for (let i = 0; i < val.length; i++) {
      const _val = val[i]
      const index = state.chats.findIndex(chat => chat.chatId === _val.chatId)
      // _val.active = { status: false, profileId: _val.profileId, lastUpdate: Date.now() }
      if (index === -1) {
        state.chats.push(_val)
      } else {
        state.chats[index] = _val
      }
      if (_val.type === 'chat') {
        this._vm.$set(state.friends, _val.profileId, {
          displayName: _val.displayName,
          status: _val.active.status,
          lastUpdate: _val.active.lastUpdate
        })
      }

      if (!state.friends[_val.profileId] && !profileIds.find(p => p._id === _val.profileId)) {
        profileIds.push({
          _id: _val.profileId,
          status: _val.active?.status || false,
          lastUpdate: _val.active?.lastUpdate || null
        })
      }
    }

    this.$repos.chatRepo.getFriends({ profileIds: profileIds.map(p => p._id) })
      .then((res) => {
        for (let i = 0; i < res.data.profiles.length; i++) {
          const element = res.data.profiles[i]
          const profile = profileIds.find(p => p._id === element._id)
          this.commit('chat/SET_FRIEND', {
            ...element,
            ...profile
          })
        }
      })
  },

  SET_FRIEND (state, val) {
    if (val?._id) {
      this._vm.$set(state.friends, val._id, val)
    }
  },

  SET_REACTIONS_LIST (state, { reactions }) {
    state.availableReactions = reactions
  },

  SET_CURRENT_CHAT (state, val) {
    state.currentChat = val
    state.currentDraft = (val && state.drafts[val.chatId]) || {}
  },

  SET_CHAT_MESSAGES (state, { chatId, messages }) {
    messages = messages.map((m) => {
      m.frontId = m.frontId || m._id
      return m
    })

    if (!state.chats.find(chat => chat.chatId === chatId)) {
      this.dispatch('chat/loadChats')
    }

    this._vm.$set(state.messages, chatId, messages)

    // Sort the message
    state.messages[chatId].sort((a, b) => {
      a = a?.createdAt ? new Date(a.createdAt) : null
      b = b?.createdAt ? new Date(b.createdAt) : null
      return a - b
    })

    this.commit('chat/UPDATE_LAST_MESSAGE_IN_CHAT', chatId)
  },

  ADD_CHAT_MESSAGES (state, { chatId, messages }) {
    messages = messages.map((m) => {
      m.frontId = m.frontId || m._id
      return m
    })

    // TODO: if chat not present, ask to backend
    if (!state.messages[chatId] || state.messages[chatId].length === 0) {
      this._vm.$set(state.messages, chatId, messages)
    } else {
      messages.forEach((message) => {
        const index = state.messages[chatId].findIndex((element) => {
          return element._id === message._id || element.frontId === message.frontId
        })
        if (index === -1) {
          state.messages[chatId].push(message)
        } else if (!state.messages[chatId][index]._id || new Date(message.updatedAt) >= new Date(state.messages[chatId][index].updatedAt)) {
          this._vm.$set(state.messages[chatId], index, message)
        }
      })
    }

    // Sort the message
    state.messages[chatId].sort((a, b) => {
      a = a?.createdAt ? new Date(a.createdAt) : null
      b = b?.createdAt ? new Date(b.createdAt) : null
      return a - b
    })

    this.commit('chat/UPDATE_LAST_MESSAGE_IN_CHAT', chatId)
  },

  UPDATE_LAST_MESSAGE_IN_CHAT (state, chatId) {
    const chatIndex = state.chats.findIndex(chat => chat.chatId === chatId)
    const allMsg = state.messages[chatId]

    let lastMessage
    let i = allMsg.length

    while (!lastMessage && i--) {
      if (!allMsg[i].isDeleted) {
        lastMessage = allMsg[i]
      }
    }

    if (chatIndex !== -1) {
      const newMessageCreatedAt = new Date(lastMessage?.createdAt) || null
      const newMessageUpdatedAt = new Date(lastMessage?.updatedAt) || null
      const actualLastMessage = state.chats[chatIndex]?.lastMessage
      const actualLastMessageCreatedAt = new Date(actualLastMessage?.createdAt) || null
      const actualLastMessageUpdatedAt = new Date(actualLastMessage?.updatedAt) || null
      if (!actualLastMessage?._id || actualLastMessage.isDeleted || (newMessageCreatedAt >= actualLastMessageCreatedAt && newMessageUpdatedAt > actualLastMessageUpdatedAt)) {
        this._vm.$set(state.chats[chatIndex], 'lastMessage', lastMessage)
      }
    }
  },

  DELETE_MESSAGE (state, { chatId, messageId, isLastMessage }) {
    const index = state.messages[chatId].findIndex(m => m._id === messageId)
    state.messages[chatId][index].isDeleted = true

    if (isLastMessage) {
      const chatIndex = state.chats.findIndex(chat => chat.chatId === chatId)
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage.isDeleted = true
      }
    }
  },

  CLEAR_CHAT_MESSAGES (state, chat) {
    if (chat?.chatId) {
      this._vm.$set(state.messages, chat.chatId, [])
    }
  },

  // SET_PENDING_MESSAGE (state, message) {
  //   const pendingIndex = state.pendingMessages.findIndex((element) => {
  //     return element.frontId === message.frontId
  //   })
  //   if (pendingIndex === -1) {
  //     state.pendingMessages.push(message)
  //   } else {
  //     state.pendingMessages.splice(pendingIndex, 1)
  //   }
  // },

  SET_CURRENT_DRAFT (state, val) {
    if (state.currentChat?.chatId) {
      this._vm.$set(state.drafts, state.currentChat.chatId, val ? { ...val } : { ...state.emptyDraft })
    }
  },
  CLEAR_CURRENT_DRAFT (state, val) {
    state.drafts[state.currentChat.chatId] = { ...state.emptyDraft }
  },

  SET_REPLY_TO_MESSAGE_ID (state, val) {
    state.currentChat && this._vm.$set(state.currentChat, 'replyToMessageId', val)
  },

  SET_FORWARD_MESSAGE_ID (state, val) {
    state.currentChat && this._vm.$set(state.currentChat, 'forwardMessageId', val)
  },

  SET_PROFILE_STATUS (state, val) {
    if (!state.friends[val.profileId]) { return }
    state.friends[val.profileId] = {
      ...state.friends[val.profileId],
      status: val.status,
      lastUpdate: val.lastUpdate
    }
  },

  SET_FILTER_TARGET (state, val) {
    state.filterTarget = val
  },

  SET_GROUP (state, val) {
    state.chats.push(val)
    this._vm.$set(state.messages, val._id, [])
    this.dispatch('chat/setCurrentChat', val)
  },

  UPDATE_GROUP (state, val) {
    const index = state.chats.findIndex(group => group._id === val._id)
    state.chats.splice(index, 1, val)

    if (state.currentChat?._id === val._id) {
      state.currentChat = val
    }
  },

  SET_BROADCAST (state, val) {
    state.chats.push(val)
    this._vm.$set(state.messages, val._id, [])
    this.dispatch('chat/setCurrentChat', val)
  },

  UPDATE_BROADCAST (state, val) {
    const index = state.chats.findIndex(broadcast => broadcast._id === val._id)
    state.chats.splice(index, 1, val)

    if (state.currentChat?._id === val._id) {
      state.currentChat = val
    }
  },

  CLEAR_SEARCH_MESSAGES (state, val) {
    state.searchMessages = []
    this.dispatch('chat/loadChatsAndMessages')
  },

  CLEAR_SEARCH_IN_CHAT_MESSAGES (state, val) {
    state.searchInChatMessages = []
  },

  SET_SEARCH_IN_CHAT_QUERY (state, val) {
    state.searchInChatQuery = val
  },

  SET_GLOBAL_SEARCH_QUERY (state, val) {
    state.globalSearchQuery = val
  },

  SET_SEARCH_CHATS (state, chats) {
    state.searchChats = chats || []
    for (let i = 0; i < chats.length; i++) {
      const chat = chats[i]
      if (!chat.active) {
        chat.active = { status: false, profileId: chat.profileId, lastUpdate: Date.now() }
        state.searchChats[i] = chat
      }
      this._vm.$set(state.friends, chat.profileId, {
        displayName: chat.displayName,
        status: chat.active.status,
        lastUpdate: chat.active.lastUpdate
      })
    }

    this.commit('chat/SET_CHATS_LIST', chats)
  },

  SET_SEARCH_MESSAGES (state, messages) {
    state.searchMessages = messages
  },

  SET_SEARCH_IN_CHAT_MESSAGES (state, messages) {
    state.searchInChatMessages = messages
  },

  ADD_FRIEND (state, profileId) {
    if (state.friends[profileId]) {
      return
    }
    this.$repos.chatRepo.getFriend({ profileId })
      .then((res) => {
        this.commit('chat/SET_FRIEND', res.data.profile)
      })
  }
}

export const actions = {
  loadChats (ctx) {
    return this.$repos.chatRepo.getChats().then((res) => {
      if (res.success === true) {
        ctx.commit('SET_CHATS_LIST', res.data.chats)
      }
    })
  },

  async loadChatsAndMessages (ctx) {
    await ctx.dispatch('loadChats')
    return Promise.all(ctx.state.chats.map((chat) => {
      return ctx.dispatch('loadMessages', { chatId: chat.chatId })
    }))
  },

  loadChat (ctx, chatId) {
    const chat = ctx.getters.getChat(chatId)
    if (chat) {
      return chat
    }
    this.$repos.chatRepo.getChat(chatId)
      .then((res) => {
        if (res.success === true) {
          ctx.commit('SET_CHATS_LIST', res.data.details)
          return res.data.details
        }
      })
  },

  getReactionsList (ctx) {
    this.$repos.chatRepo.getReactionsList()
      .then((res) => {
        if (res.success === true) {
          ctx.commit('SET_REACTIONS_LIST', res.data)
        }
      })
  },

  setCurrentChat (ctx, chat) {
    ctx.commit('SET_SEARCH_IN_CHAT_QUERY', '')
    ctx.commit('CLEAR_SEARCH_IN_CHAT_MESSAGES')
    if (!ctx.state.chats.some(c => c._id === chat._id)) { return }
    // const chatId = chat.chatId
    // return ctx.dispatch('loadMessages', { chatId }).then(() => {
    ctx.commit('SET_CURRENT_CHAT', chat)
    // })
  },

  loadMessages (ctx, { chatId = null, limit = null }) {
    chatId = chatId || ctx.state.currentChat.chatId
    const chat = ctx.state.chats.find(chat => chat.chatId === chatId)
    return this.$repos.chatRepo.getMessages(chat, limit).then((res) => {
      if (res.data.messages) {
        const messages = res.data.messages.filter(message => !message.isDeleted)
        return ctx.commit('SET_CHAT_MESSAGES', { chatId, messages })
      }
    })
  },

  loadOldestMessages (ctx, { chatId = null, toMessageId = null, limit = null }) {
    chatId = chatId || ctx.state.currentChat.chatId
    const chat = ctx.state.chats.find(chat => chat.chatId === chatId)
    return this.$repos.chatRepo.getOldestMessages(chat, toMessageId, limit).then((res) => {
      if (res.data.messages) {
        const messages = res.data.messages.filter(message => !message.isDeleted)
        return ctx.commit('ADD_CHAT_MESSAGES', { chatId, messages })
      }
    })
  },

  loadLatestMessages (ctx, { chatId = null, fromMessageId = null, limit = null }) {
    chatId = chatId || ctx.state.currentChat.chatId
    const chat = ctx.state.chats.find(chat => chat.chatId === chatId)
    return this.$repos.chatRepo.getLatestMessages(chat, fromMessageId, limit).then((res) => {
      if (res.data.messages) {
        const messages = res.data.messages.filter(message => !message.isDeleted)
        return ctx.commit('ADD_CHAT_MESSAGES', { chatId, messages })
      }
    })
  },

  loadSearchedMessages (ctx, { chatId = null, searchedMessageId = null, limit = null }) {
    chatId = chatId || ctx.state.currentChat.chatId
    const chat = ctx.state.chats.find(chat => chat.chatId === chatId)
    return this.$repos.chatRepo.getSearchedMessages(chat, searchedMessageId, limit).then((res) => {
      if (res.data.messages) {
        const messages = res.data.messages.filter(message => !message.isDeleted)
        return ctx.commit('ADD_CHAT_MESSAGES', { chatId, messages })
      }
    })
  },

  loadMessage (ctx, { messageId }) {
    return this.$repos.chatRepo.getMessage(messageId).then((res) => {
      ctx.dispatch('setMessage', res)
    })
  },

  getAttachment (_, payload) {
    return this.$repos.chatRepo.getAttachment(payload)
  },

  setDraft (ctx, draft) {
    ctx.commit('SET_DRAFT', draft)
  },

  sendMessage (ctx, message = {}) {
    const payload = {
      ...message,
      ...(ctx.state.currentChat.type === 'chat' ? { toProfileId: ctx.state.currentChat.profileId } : null),
      ...(ctx.state.currentChat.type === 'group' ? {
        groupId: ctx.state.currentChat._id,
        toProfileIds: ctx.state.currentChat.filter?.profiles?.map(p => p._id)
      } : null),
      ...(ctx.state.currentChat.type === 'broadcast' ? {
        broadcastId: ctx.state.currentChat._id,
        toProfileIds: ctx.state.currentChat.filter?.profiles?.map(p => p._id)
      } : null),
      ...(ctx.state.currentChat.profileId ? { toProfileId: ctx.state.currentChat.profileId } : null),
      chatId: ctx.state.currentChat.chatId,
      frontId: message.frontId || Date.now() + '-' + (Math.floor(Math.random() * 1000)),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    const { replyToMessageId, type } = ctx.state.currentChat

    if (replyToMessageId) {
      payload.replyToMessageId = replyToMessageId
    }

    // ctx.commit('SET_PENDING_MESSAGE', payload)
    ctx.dispatch('_setMessage', payload)

    // ctx.dispatch('setDraft', '')

    return this.$repos.chatRepo.sendMessage(payload, type).then((res) => {
      ctx.dispatch('setMessage', res)
      // ctx.commit('SET_PENDING_MESSAGE', res.data.message)
    })
  },

  deleteMessage ({ state, commit, getters }, message) {
    const { isViewed, _id: messageId } = message

    if (!isViewed) {
      this.$repos.chatRepo.deleteMessage({ messageId }).then(() => {
        const chat = getters.getChatFromMessage(message)
        const chatId = chat.chatId
        const isLastMessage = chat.lastMessage._id === messageId

        commit('DELETE_MESSAGE', { chatId, messageId, isLastMessage })
        if (isLastMessage) {
          commit('UPDATE_LAST_MESSAGE_IN_CHAT', chatId)
        }
      })
    }
  },

  // From socket
  setChat ({ commit }, res) {
    const chat = res.data?.chat

    if (chat) {
      commit('SET_CHATS_LIST', [chat])
    }
  },

  // From socket
  setMessage (ctx, res) {
    if (res?.data?.message?._id) {
      ctx.dispatch('_setMessage', res.data.message)
    }
  },

  // Internal use
  _setMessage (ctx, message) {
    // ctx.commit('SET_CHAT_MESSAGES', { chatId, messages: [message] })
    ctx.commit('ADD_CHAT_MESSAGES', { chatId: message.chatId, messages: [message] })
  },

  setMessageReaction (ctx, payload) {
    if (!payload.messageId || !payload.reactionId) { return }
    this.$repos.chatRepo.setMessageReaction(payload)
  },

  deleteMessageReaction (ctx, payload) {
    if (!payload.messageId || !payload.reactionId) { return }
    this.$repos.chatRepo.deleteMessageReaction(payload)
  },

  setProfileStatus (ctx, res) {
    ctx.commit('SET_PROFILE_STATUS', res.data)
  },

  setMessageView (ctx, message) {
    const chat = ctx.getters.getChatFromMessage(message)
    this.$repos.chatRepo.setMessageView({
      messageId: message._id
    }, chat?.type)
  },

  getFilterTarget ({ commit }) {
    return this.$repos.chatRepo.filterTarget({ query: '' })
      .then(({ data }) => {
        commit('SET_FILTER_TARGET', data.filter)
      })
  },

  getGroup (_, chatId) {
    return this.$repos.chatRepo.getGroup({ chatId })
  },

  createGroup ({ commit }, payload) {
    return this.$repos.chatRepo.createGroup(payload).then((res) => {
      const group = res.data.group
      group.displayName = group.name
      group.type = 'group'
      delete group.name
      commit('SET_GROUP', group)
    })
  },

  updateGroup ({ commit }, { chatId, ...rest }) {
    return this.$repos.chatRepo.updateGroup({ chatId, ...rest }).then((res) => {
      const group = res.data.group
      group.displayName = group.name
      group.type = 'group'
      delete group.name
      commit('UPDATE_GROUP', group)
    })
  },

  changeGroupMemberStatus ({ commit }, payload) {
    return this.$repos.chatRepo.changeGroupMemberStatus(payload).then((res) => {
      const group = res.data.group
      group.displayName = group.name
      group.type = 'group'
      delete group.name
      commit('UPDATE_GROUP', group)
    })
  },

  getBroadcast (_, chatId) {
    return this.$repos.chatRepo.getBroadcast({ chatId })
  },

  createBroadcast ({ commit }, payload) {
    return this.$repos.chatRepo.createBroadcast(payload).then((res) => {
      const broadcast = res.data.broadcast
      broadcast.displayName = broadcast.name
      broadcast.type = 'broadcast'
      delete broadcast.name
      commit('SET_BROADCAST', broadcast)
    })
  },

  updateBroadcast ({ commit }, { chatId, ...rest }) {
    return this.$repos.chatRepo.updateBroadcast({ chatId, ...rest }).then((res) => {
      const broadcast = res.data.broadcast
      broadcast.displayName = broadcast.name
      broadcast.type = 'broadcast'
      delete broadcast.name
      commit('UPDATE_BROADCAST', broadcast)
    })
  },

  clearChatMessages ({ commit }, chat) {
    commit('CLEAR_CHAT_MESSAGES', chat)
  },

  resetSearch ({ commit }) {
    commit('RESET_SEARCH_CHATS', [])
    commit('RESET_SEARCH_MESSAGES')
  },

  setSearchInChatQuery ({ commit }, val) {
    commit('SET_SEARCH_IN_CHAT_QUERY', val)
  },

  setGlobalSearchQuery ({ commit }, val) {
    commit('SET_GLOBAL_SEARCH_QUERY', val)
  },

  searchMessages ({ commit }, payload) {
    this.$repos.chatRepo.searchMessages(payload)
      .then((res) => {
        commit('SET_SEARCH_MESSAGES', res.data.messages)
      })
  },

  searchChats ({ commit }, payload) {
    this.$repos.chatRepo.searchChats(payload)
      .then((res) => {
        commit('SET_SEARCH_CHATS', res.data.chats)
      })
  },

  searchInChatMessages ({ commit }, payload) {
    this.$repos.chatRepo.searchMessages(payload)
      .then((res) => {
        commit('SET_SEARCH_IN_CHAT_MESSAGES', res.data.messages)
      })
  },

  clearGlobalSearchMessages ({ commit }) {
    commit('CLEAR_SEARCH_MESSAGES')
  },

  clearSearchInChatMessages ({ commit }) {
    commit('CLEAR_SEARCH_IN_CHAT_MESSAGES')
  },

  getFriend ({ commit }, profileId) {
    commit('ADD_FRIEND', profileId)
  }
}
