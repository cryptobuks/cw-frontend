<template>
  <div class="base-chat-search">
    <div class="absolute inset-0 flex items-center pl-8 pointer-events-none">
      <span class="relative w-5 h-5" @click.stop="handlePreInputBtn($event, true)">
        <transition
          :enter-class="showBackBtn || search.length ? 'opacity-0 transform -rotate-90' : 'opacity-0 transform rotate-90'"
          :leave-to-class="showBackBtn || search.length ? 'opacity-0 transform rotate-90' : 'opacity-0 transform -rotate-90'"
          enter-active-class="transition-opacity transition-transform duration-300"
          leave-active-class="transition-opacity transition-transform duration-300"
        >
          <svg
            v-if="showBackBtn || search.length"
            key="back-btn"
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current fill-current absolute pointer-events-auto cursor-pointer"
            style="color: #be0000"
            viewBox="0 0 24 24"
          >
            <!-- <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /> -->
            <path d="M23.896 10.533H5.766l8.327-8.328-2.115-2.1L.06 12.021 11.978 23.94l2.1-2.1-8.313-8.328h18.13z" />
          </svg>
          <svg
            v-else
            key="magnifier"
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-current absolute pointer-events-auto cursor-pointer"
            style="color: #979797"
            fill="none"
            viewBox="0 0 27 27"
          >
            <circle cx="11.127" cy="11.127" r="10.127" stroke-width="2.5" />
            <path stroke-linecap="round" stroke-width="2.5" d="M18.605 18.961l7.393 6.645" />
          </svg>
        </transition>
      </span>
    </div>
    <textarea
      ref="searchInput"
      v-model="search"
      :placeholder="$t('global.search')"
      aria-label="search contacts"
      @keydown="keydownHandler"
      @focus="handlePreInputBtn()"
      @blur="handlePreInputBtn()"
    />
    <div
      v-show="search"
      class="absolute right-0 flex items-center pr-8 cursor-pointer"
      @click.stop="clear"
    >
      <base-icon name="time-circle" size="20" />
    </div>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  data () {
    return {
      showBackBtn: false,
      search: '',
      searchActive: false
    }
  },

  watch: {
    search: _.debounce(function (val) {
      this.handleSearch(val)
    }, 500)
  },

  created () {
    this.$nuxt.$on('chat:searchActive', (val) => {
      this.searchActive = val
    })
  },

  methods: {
    clear () {
      this.search = ''
    },

    keydownHandler (e) {
      const keyCode = e.which || e.keyCode
      if (keyCode === 13) {
        e.preventDefault()
      }
    },

    handlePreInputBtn ($event, clear = null) {
      if (this.showBackBtn) {
        this.$refs.searchInput.blur()
      } else {
        this.$refs.searchInput.focus()
      }
      this.showBackBtn = !this.showBackBtn
      if (clear) {
        this.clear()
      }
    },

    handleSearch (val) {
      if (!val || val.length <= 2) {
        this.$nuxt.$emit('chat:searchActive', false)
        this.$store.dispatch('chat/setGlobalSearchQuery', val)
        this.$store.dispatch('chat/clearGlobalSearchMessages')
        this.$store.dispatch('chat/loadChats')
        return
      }
      if (val.length > 2) {
        this.$store.dispatch('chat/setGlobalSearchQuery', val)
        this.$store.dispatch('chat/searchChats', {
          query: val
        })
        this.$store.dispatch('chat/searchMessages', {
          query: val
        })
      }
      if (!this.searchActive) {
        this.$nuxt.$emit('chat:searchActive', true)
      }
    }
  }
}
</script>

<style scoped>
.base-chat-search {
  @apply bg-gray-200 relative flex items-center w-full border-b border-gray-750 border-opacity-25 font-poppins-light py-3 px-3;
}

textarea {
  height: 50px;
  line-height: 50px;
  min-width: 2px;
  scrollbar-width: thin;
  scrollbar-color: var(--thumbBG) var(--scrollbarBG);
  @apply w-full rounded-10px resize-none bg-white bg-opacity-50 border overflow-hidden pl-14 pr-14 text-lg;

  &:focus {
    @apply bg-opacity-100;
  }

  &:not(:focus):empty::before {
    content: attr(data-placeholder);
    pointer-events: none;
    @apply text-gray-750 text-opacity-50 truncate;
  }

  &:placeholder-shown {
    @apply whitespace-nowrap;
  }
}
</style>
