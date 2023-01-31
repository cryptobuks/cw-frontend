<template>
  <cw-base-group-broadcast-members
    :source="source"
    :active-members="filteredBroadcastRecepients"
    :hide-status="true"
    @show-info="$emit('show-info')"
  />
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  props: {
    searchText: { type: String, default: '' }
  },
  computed: {
    ...mapState('chat', {
      source: 'currentChat'
    }),
    ...mapGetters('chat', {
      currentChatRecepients: 'getCurrentBroadcastRecepients'
    }),
    filteredBroadcastRecepients () {
      return this.searchText
        ? this.currentChatRecepients.filter(r => (r.displayName ?? r.profileId).toLowerCase().includes(this.searchText.toLowerCase()))
        : this.currentChatRecepients
    }
  }
}
</script>

<style lang="postcss" scoped>
.description {
  @apply text-sm truncate;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 3) and (-webkit-box-orient: vertical) {
    text-overflow: initial;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}

.tab {
  @apply w-full;

  &:focus {
    @apply outline-none;
  }

  & span {
    padding-bottom: 2px;
    @apply text-sm text-cw-red font-semibold border-cw-red;
  }
}
</style>
