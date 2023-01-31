const service = 'chat'

export default ctx => ({
  getAttachment (payload) {
    return ctx.$socket.sendAndRead({
      service,
      module: 'message',
      action: 'getAttachment',
      payload
    })
  },

  getChats () {
    return ctx.$socket.sendAndRead({
      service,
      module: 'chat',
      action: 'getChats'
    })
  },

  getChat (chatId) {
    return ctx.$socket.sendAndRead({
      service,
      module: 'chat',
      action: 'getChat',
      payload: {
        chatId
      }
    })
  },

  getReactionsList () {
    return ctx.$socket.sendAndRead({
      service,
      module: 'message',
      action: 'getReactionsList'
    })
  },

  getMessage (messageId) {
    return ctx.$socket.sendAndRead({
      service,
      module: 'message',
      action: 'getMessage',
      payload: {
        messageId
      }
    })
  },

  getMessages (chat, fromMessageId = null, toMessageId = null, limit = null, offset = null) {
    let module = 'message'
    let action = 'getMessages'
    if (chat.type === 'group') {
      module = 'groupMessage'
      action = 'getGroupMessages'
    }
    if (chat.type === 'broadcast') {
      module = 'broadcastMessage'
      action = 'getBroadcastMessages'
    }
    return ctx.$socket.sendAndRead({
      service,
      module,
      action,
      payload: {
        chatId: chat.chatId,
        ...(fromMessageId ? { fromMessageId } : null),
        ...(toMessageId ? { toMessageId } : null),
        ...(limit ? { limit } : null),
        ...(offset ? { offset } : null)
      }
    })
  },

  getOldestMessages (chat, toMessageId = null, limit = null) {
    let module = 'message'
    if (chat.type === 'group') {
      module = 'groupMessage'
    }
    if (chat.type === 'broadcast') {
      module = 'broadcastMessage'
    }
    return ctx.$socket.sendAndRead({
      service,
      module,
      action: 'getOldestMessages',
      payload: {
        chatId: chat.chatId,
        ...(toMessageId ? { toMessageId } : null),
        ...(limit ? { limit } : null)
      }
    })
  },

  getLatestMessages (chat, fromMessageId = null, limit = null) {
    let module = 'message'
    if (chat.type === 'group') {
      module = 'groupMessage'
    }
    if (chat.type === 'broadcast') {
      module = 'broadcastMessage'
    }
    return ctx.$socket.sendAndRead({
      service,
      module,
      action: 'getLatestMessages',
      payload: {
        chatId: chat.chatId,
        ...(fromMessageId ? { fromMessageId } : null),
        ...(limit ? { limit } : null)
      }
    })
  },

  getSearchedMessages (chat, searchedMessageId = null, limit = null) {
    let module = 'message'
    if (chat.type === 'group') {
      module = 'groupMessage'
    }
    if (chat.type === 'broadcast') {
      module = 'broadcastMessage'
    }
    return ctx.$socket.sendAndRead({
      service,
      module,
      action: 'getSearchedMessages',
      payload: {
        chatId: chat.chatId,
        ...(searchedMessageId ? { searchedMessageId } : null),
        ...(limit ? { limit } : null)
      }
    })
  },

  deleteMessage (payload) {
    return ctx.$socket.sendAndRead({
      service,
      module: 'message',
      action: 'deleteMessage',
      payload
    })
  },

  sendMessage (payload, type = 'chat') {
    const data = {
      service,
      module: 'message',
      action: 'createMessage',
      payload
    }
    if (type === 'group') {
      data.module = 'groupMessage'
      data.action = 'createGroupMessage'
    }
    if (type === 'broadcast') {
      data.module = 'broadcastMessage'
      data.action = 'createBroadcastMessage'
    }

    return ctx.$socket.sendAndRead(data)
  },

  setMessageReaction (payload) {
    return ctx.$socket.sendAndRead({
      service,
      module: 'message',
      action: 'setMessageReaction',
      payload
    })
  },

  deleteMessageReaction (payload) {
    return ctx.$socket.sendAndRead({
      service,
      module: 'message',
      action: 'deleteMessageReaction',
      payload
    })
  },

  setMessageView (payload, type = 'chat') {
    const data = {
      service,
      module: 'message',
      action: 'setMessageView',
      payload
    }
    if (type === 'group') {
      data.module = 'groupMessage'
    }
    return ctx.$socket.sendAndRead(data)
  },

  setMessageClick (payload) {
    return ctx.$socket.sendAndRead({
      service,
      module: 'message',
      action: 'setMessageClick',
      payload
    })
  },

  searchChats (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'chat',
      action: 'searchChats',
      payload
    })
  },

  searchMessages (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'message',
      action: 'searchMessages',
      payload
    })
  },

  getPreview (payload) {
    return ctx.$socket.sendAndRead({
      service,
      module: 'webPreview',
      action: 'getPreview',
      payload
    })
  },

  filterTarget (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'broadcast',
      action: 'filterTarget',
      payload
    })
  },

  getGroups () {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'group',
      action: 'getGroups'
    })
  },

  getGroup (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'group',
      action: 'getGroup',
      payload
    })
  },

  createGroup (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'group',
      action: 'createGroup',
      payload
    })
  },

  updateGroup (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'group',
      action: 'updateGroup',
      payload
    })
  },

  changeGroupMemberStatus (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'group',
      action: 'changeMemberStatus',
      payload
    })
  },

  getGroupMessages (groupId, offset, limit) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'groupMessage',
      action: 'getGroupMessages',
      payload: {
        groupId,
        ...(offset ? { offset } : null),
        ...(limit ? { limit } : null)
      }
    })
  },

  getBroadcasts () {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'broadcast',
      action: 'getBroadcasts'
    })
  },

  getBroadcast (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'broadcast',
      action: 'getBroadcast',
      payload
    })
  },

  createBroadcast (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'broadcast',
      action: 'createBroadcast',
      payload
    })
  },

  updateBroadcast (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'broadcast',
      action: 'updateBroadcast',
      payload
    })
  },

  getBroadcastMessages (broadcastId, offset, limit) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'broadcastMessage',
      action: 'getBroadcastMessages',
      payload: {
        broadcastId,
        ...(offset ? { offset } : null),
        ...(limit ? { limit } : null)
      }
    })
  },

  getFriends (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'chat',
      action: 'getFriends',
      payload
    })
  },

  getFriend (payload) {
    return ctx?.$socket?.sendAndRead({
      service,
      module: 'chat',
      action: 'getFriend',
      payload
    })
  }
})
