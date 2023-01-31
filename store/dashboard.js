
export const state = () => ({
  mesages: [],
  cards: []
})

export const mutations = {
  SET_CARDS (state, cards) {
    state.cards = cards
  }
}

export const actions = {
  getOtherCardServices (context, payload) {
    context.commit('SET_CARDS', payload)
  }
}

export const getters = {
  mappedCardGetter: (state, getters, rootState) => (auth) => {
    const userId = auth.user?._id
    let newMessage = []
    const filteredMessage = []

    for (const chatId in rootState.chat?.messages) {
      newMessage = newMessage.concat(rootState.chat?.messages[chatId])
    }

    newMessage.forEach((item) => {
      if (item.showInDashboard && userId === item.toProfileId) {
        filteredMessage.push({
          type: 'message',
          profileId: item.toProfileId,
          refId: item._id,
          service: 'chat',
          area: 'todo',
          data: {
            message: item.content.text,
            userProfileId: item.toProfileId
          },
          ...item
        })
      }
    })
    const cards = [].concat(filteredMessage, state.cards)
    if (auth.isBusiness()) {
      return getters.getBusinessCard(cards)
    } else {
      return getters.getUserCards(cards)
    }
  },
  getUserCards: state => (cards) => {
    const result = groupBy(cards, function (item) {
      return [item?.type, item?.fromProfileId]
    }).filter(item => !item.isManaged)
    return result
  },
  getBusinessCard: (state, getters) => (cards) => {
    const result = groupBy(cards, function (item) {
      return [item?.fromProfileId]
    })
    return result
  }
}

function groupBy (array, f) {
  const groups = {}
  array.forEach(function (o) {
    const group = JSON.stringify(f(o))
    groups[group] = groups[group] || []
    groups[group].push(o)
  })
  return Object.keys(groups).map(function (group) {
    return groups[group]
  })
}
