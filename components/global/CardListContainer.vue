<template>
  <base-card-loading v-if="loading" />

  <div
    v-else
    :class="[itemClass || 'base-card-list', !items.length ? 'is-empty' : null]"
    :style="{ '--min-item-width': minItemWidth + 'px' }"
  >
    <div
      v-for="(item, i) in items"
      ref="items"
      :key="item._id || item.id || i"
      :style="itemStyle"
    >
      <slot v-if="!(hiddenIndex <= i)" name="item" :item="item" :index="i" />
    </div>

    <h4 v-if="!items.length" class="base-card-list__empty">
      <slot v-if="!loading" name="empty">
        {{ emptyText || $t("card.search_empty") }}
      </slot>
    </h4>
  </div>
</template>

<script>
export default {
  props: {
    items: { type: Array, default: () => [] },
    emptyText: { type: String, default: null },
    itemClass: { type: String, default: null },
    loading: Boolean,
    itemHeight: { type: [String, Number], default: null },
    minItemWidth: { type: [Number, String], default: '223' }
  },
  data () {
    return {
      // The sole purpose of this is to optimize perf
      // With less than, let's say 30* items being rendered, perf will be fine
      // * : Changed from 30 to 50
      hiddenIndex: 50
    }
  },
  computed: {
    itemStyle () {
      return this.itemHeight
        ? {
          height:
              typeof this.itemHeight === 'number'
                ? this.itemHeight + 'px'
                : this.itemHeight
        }
        : {}
    }
  },
  watch: {
    items: 'resetHiddenIndex'
  },
  mounted () {
    if (this.items.length) {
      this.resetHiddenIndex()
    }
  },
  methods: {
    resetHiddenIndex () {
      this.$nextTick(() => {
        this.hiddenIndex = 50

        const $container = this.findScrollableParent(this.$el)
        if ($container) {
          $container.scrollTop = 0
          $container.removeEventListener('scroll', this.onScroll)
          $container.addEventListener('scroll', this.onScroll)
        }
      })
    },
    onScroll (evt) {
      if (!evt.target || !this.$refs.items.length) {
        return
      }

      const { scrollTop, clientHeight } = evt.target
      const threshold = scrollTop + clientHeight + 200
      for (let i = this.hiddenIndex; i < this.items.length; i++) {
        if (this.$refs.items[i].offsetTop > threshold) {
          this.hiddenIndex = i
          return
        }
      }

      evt.target.removeEventListener('scroll', this.onScroll)
      this.hiddenIndex = {}
    },
    findScrollableParent (parentEl) {
      return parentEl
        ? parentEl.scrollHeight > parentEl.clientHeight
          ? parentEl
          : this.findScrollableParent(parentEl.parentNode)
        : document.documentElement
    }
  }
}
</script>

<style lang="scss">
.base-card-list {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(var(--min-item-width, 223px), 1fr)
  );
  grid-gap: 15px;
  padding: 15px;
  width: 100%;

  &.is-empty {
    @apply flex justify-center items-center text-center h-full bg-gray-150 bg-opacity-60;
  }

  &__empty {
    font-size: 30px;
    font-weight: 700;

    @apply text-black;
  }
}
</style>
