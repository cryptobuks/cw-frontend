<template>
  <div
    class="cw-sidebar"
    :class="{'cw-sidebar--collapsed': isCollapsed}"
    @mouseenter="autoExpand"
    @mouseleave="autoCollapse"
  >
    <div class="cw-sidebar__header">
      <span class="cw-sidebar__header__toggle" @click="isCollapsed = !isCollapsed">
        <base-icon size="30">menu</base-icon>
      </span>

      <span class="cw-sidebar__header__title" @click="isCollapsed = !isCollapsed">
        {{ $t('nav.menu') }}
      </span>
    </div>

    <div class="cw-sidebar__body">
      <base-scroll class="cw-sidebar__items" :style="{ width: isCollapsed ? '140px' : '288px' }">
        <cw-vertical-menu-item
          v-for="item in items"
          :key="item.label"
          :item="item"
          :opened="opened"
          :is-collapsed="isCollapsed"
          @opened="opened = $event"
        />
      </base-scroll>
    </div>
  </div>
</template>

<script>

export default {
  name: 'CwSidebar',

  props: {
    items: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      isCollapsed: false,
      opened: null
    }
  },
  computed: {
    shouldAutoCollapse () {
      return ['mobile', 'tablet', 'desktop', 'widescreen'].includes(this.$mq)
    }
  },
  mounted () {
    this.isCollapsed = this.shouldAutoCollapse
  },
  methods: {
    autoExpand () {
      if (this.shouldAutoCollapse) {
        this.isCollapsed = false
      }
    },
    autoCollapse () {
      if (this.shouldAutoCollapse) {
        this.isCollapsed = true
      }
    }
  }
}
</script>

<style lang="scss">
.cw-sidebar {
  width: 288px;
  transition: width 0.2s;
  transition-timing-function: ease;
  margin-right: 20px;
  @apply flex flex-col bg-transparent opacity-90 overflow-visible max-h-full rounded-10px;

  &--collapsed {
    width: 140px !important;
    transition: width 0.4s ease-in !important;

    .cw-sidebar__header {
      &__title {
        opacity: 0;
        display: none;
      }
    }

    .cw-sidebar__items {
      transition: width 0.4s ease-in !important;
    }
  }

  &__header {
    padding: 25px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid lightgray;
    height: 80px;
    background-color: rgba(#f5f5f5, 0.9);
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    overflow: hidden;

    @apply shadow;

    &__toggle {
      margin-right: 35px;
      cursor: pointer;
    }

    &__title {
      font-size: 22px;
      font-weight: 600;
      color: #262626;
      cursor: pointer;

      opacity: 1;
      transition: opacity 5s;
    }
  }

  &__body {
    max-height: calc(100% - 80px);
    @apply bg-gray-150 bg-opacity-90 overflow-x-hidden py-6 px-0 rounded-b-10px shadow;
  }

  &__items {
    max-height: 100%;
    transition: width 0.2s;
    transition-timing-function: ease;
  }
}
</style>
