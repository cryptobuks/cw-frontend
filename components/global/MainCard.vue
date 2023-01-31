<template>
  <div
    class="base-card"
    :class="{
      'is-mobile': isMobileView,
      'no-border': noBorder,
      'is-child-card': isChildCard
    }"
    :style="{ borderRadius: $auth.isUser() ? 0 : null }"
  >
    <header class="base-card__header">
      <slot name="header">
        <slot name="back">
          <span
            v-if="showBackButton || isChildCard"
            class="base-card__back"
            @click="goBack"
          >
            <base-icon name="chevron-left" />
          </span>
        </slot>

        <h2
          v-if="!noTitle"
          v-show="!showOnlyTitleOrSearch || !isSearchOpened"
          v-auto-resize-text="{ min: 18, max: 22 }"
          class="base-card__title"
        >
          <slot name="title-text">
            {{ title }}
          </slot>
        </h2>

        <template v-if="!hideSearch">
          <base-input-text
            v-show="!showOnlyTitleOrSearch || isSearchOpened"
            ref="search"
            type="search"
            :value="searchText"
            :placeholder="searchPlaceholder"
            light
            naked
            prepend-icon="search"
            class="base-card__search"
            :class="{ 'flex-grow': showOnlyTitleOrSearch && isSearchOpened, 'w-full': fullInputWidth }"
            input-class="h-full"
            @input="onSearchTextChange"
          />

          <div v-if="showOnlyTitleOrSearch" class="base-card__action" @click="toggleSearch">
            <base-icon :name="isSearchOpened ? 'dismiss' : 'search'" :size="isSearchOpened ? 16 : 20" />
          </div>
        </template>

        <div
          v-for="(action, i) in actions"
          :key="i"
          v-tippy="isMobileView ? false : action.tooltip"
          class="base-card__action"
          :style="{ color: action.color }"
          @click="action.handler && action.handler()"
        >
          <slot :name="`action:${action.name || i}`">
            <base-icon :name="action.icon" :size="action.size || 20" />
          </slot>
        </div>
      </slot>
    </header>

    <main class="base-card__main">
      <base-scroll
        :class="[bodyClass]"
        class="base-card__body"
      >
        <slot :search-text="searchText" :items="searchedItems" />
      </base-scroll>
    </main>

    <footer
      v-if="!!$scopedSlots.footer"
      class="base-card__footer"
      :style="{ backgroundColor: footerBackground }"
    >
      <slot name="footer" />
    </footer>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    title: { type: String, default: '' },
    showBackButton: Boolean,
    showSearchToggler: Boolean,
    hideSearch: Boolean,
    noBorder: Boolean,
    items: { type: Array, default: () => [] },
    itemText: { type: Function, default: item => item.title },
    searchPlaceholder: {
      type: String,
      default () {
        return this.$t('global.search')
      }
    },
    debounceDuration: { type: Number, default: 0 },
    actions: { type: Array, default: () => [] },
    bodyClass: { type: String, default: '' },
    footerBackground: { type: String, default: '#ececec' },
    previousPage: { type: String, default: null },
    noTitle: { type: Boolean, default: false },
    fullInputWidth: { type: Boolean, default: false }
  },

  data () {
    return {
      searchText: '',
      isSearchOpened: false,
      isChildCard: false,
      oldParent: null
    }
  },

  computed: {
    isMobileView () {
      return this.$mq === 'mobile'
    },

    searchedItems () {
      const text = this.searchText.toLowerCase().trim()
      if (!text) {
        return this.items
      }

      return this.items.filter(item => this.itemText(item).toLowerCase().includes(text))
    },

    showOnlyTitleOrSearch () {
      return this.isMobileView || this.showSearchToggler
    }
  },

  mounted () {
    // If being nested inside another card. Hide it and take all of ties space
    const ancestorCard = this._findDirectMainCardAncestor(this.$el.parentNode)
    if (ancestorCard) {
      this.oldParent = this.$el.parentNode
      ancestorCard.setAttribute('invisible', '')
      ancestorCard.appendChild(this.$el)

      this.$once('hook:beforeDestroy', () => {
        ancestorCard.removeAttribute('invisible')
      })

      this.isChildCard = true
    }
  },

  methods: {
    toggleSearch () {
      this.isSearchOpened = !this.isSearchOpened
      this.$nextTick(() => {
        this.isSearchOpened && this.$refs.search && this.$refs.search.focus()
      })
    },

    onSearchTextChange (text) {
      this.searchText = (text || '').trim()

      this.$utils.debounce(() => {
        this.$emit('search', this.searchText)
      }, this.debounceDuration)
    },

    goBack () {
      if (this.isChildCard) {
        this.oldParent?.appendChild(this.$el)
      }

      if (this.$listeners.back) {
        this.$emit('back')
      } else if (this.$route.query.from) {
        this.$router.replace(this.$route.query.from)
      } else if (this.previousPage) {
        this.$router.push(this.previousPage)
      }
    },

    _findDirectMainCardAncestor (parentEl) {
      return parentEl
        ? parentEl.classList?.contains('base-card')
          ? parentEl
          : this._findDirectMainCardAncestor(parentEl.parentNode)
        : null
    }
  }
}
</script>

<style lang="scss">
.base-card {
  @apply flex flex-col flex-grow overflow-hidden rounded-10px shadow;

  &[invisible] {
    visibility: hidden !important;
    pointer-events: none !important;
    @apply relative;
  }

  &.is-child-card {
    position: absolute !important;
    @apply visible pointer-events-auto inset-0;

    @media print {
      @apply invisible;
    }

    & > .base-card__header {
      @apply pl-3 pr-5;

      & > .base-card {
        &__back {
          @apply text-base mr-3;
        }

        &__title {
          @apply mr-3;
        }
      }
    }
  }

  &.is-mobile {
    @apply rounded-none shadow-none;

    .base-card {
      &__header {
        min-height: 65px;
        padding: 10px 12px;
      }

      &__title {
        font-size: 20px;
      }

      &__main {
        @apply border-none rounded-none;
      }
    }
  }

  &.no-border {
    &, .base-card {
      .base-card__main {
        border: none;
      }
    }
  }

  .base-card {
    &__header {
      padding-top: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid lightgray;
      font-size: 22px;
      @apply flex items-center flex-shrink-0 min-h-20 bg-gray-150 bg-opacity-90 px-6 relative z-10;
    }

    &__back {
      @apply flex items-center justify-center flex-shrink-0 ml-0 mr-4 outline-none cursor-pointer h-full;
    }

    &__title {
      @apply font-semibold text-black mr-5 flex-grow overflow-hidden capitalize;
    }

    &__action {
      color: darkgrey;
      @apply flex items-center h-full ml-5 outline-none cursor-pointer;
    }

    &__search {
      min-width: 170px;
      width: 30%;
      max-width: 100%;
      @apply bg-white h-full py-0 px-4 mb-0 rounded-10px;

      &.w-full {
        width: 100%;
      }

      input {
        font-size: 1rem;
      }
    }

    &__main {
      border-left-width: 5px;
      border-right-width: 5px;
      @apply flex-1 border-solid overflow-hidden border-gray-150 border-opacity-90;

      &:last-child {
        border-bottom-width: 5px;
      }
    }

    &__body {
      @apply h-full;
    }

    &__footer {
      border-bottom-width: 5px;
      @apply flex-shrink-0 border-solid border-gray-150 border-opacity-90 bg-opacity-90;

      @media (min-width: 768px) {
        border-left-width: 5px;
        border-right-width: 5px;
      }
    }
  }
}
</style>
