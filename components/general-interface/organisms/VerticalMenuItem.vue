<template>
  <div
    v-if="isShown"
    class="cw-sidebar__item-container"
    :class="{
      'is-opened': isOpened,
      'is-collapsed': isCollapsed
    }"
  >
    <base-link
      v-tippy="isCollapsed ? {
        content: $t(item.label),
        placement : 'right',
        popperOptions: {
          modifiers: [
            { name: 'offset', options: { offset: [0, -50] } }
          ]
        }
      } : false"
      :to="item.to"
      class="cw-sidebar__item"
      @click.native="onItemClick"
    >
      <div class="cw-sidebar__icon">
        <base-icon :name="item.icon" size="27" />
      </div>

      <div class="cw-sidebar__mark" />

      <div v-auto-resize-text="isCollapsed ? false : { tooltipOnly: true }" class="cw-sidebar__title">
        {{ $t(item.label) }}
      </div>

      <div
        class="cw-sidebar__chevron"
        :class="{ disabled: !item.submenu }"
        @click.stop.prevent="toggleSubMenu()"
      >
        <base-icon size="16" :rotate="isOpened ? 90 : 0">
          chevron-right
        </base-icon>
      </div>
    </base-link>

    <div v-show="isOpened" class="cw-sidebar__submenu">
      <base-link
        v-for="subItem in submenu"
        :key="subItem.label"
        v-tippy="isCollapsed && isOpened ? {
          placement : 'right',
          content: $t(subItem.label),
          popperOptions: {
            modifiers: [
              { name: 'flip', enabled: false },
              { name: 'offset', options: { offset: [0, -5] } }
            ]
          }
        } : false"
        :to="subItem.to"
        class="cw-sidebar__submenu__item"
      >
        <div class="cw-sidebar__mark" />

        <span
          v-auto-resize-text="{ tooltipOnly: true }"
          class="cw-sidebar__submenu__title"
        >
          {{ $t(subItem.label) }}
        </span>
      </base-link>
    </div>
  </div>
</template>

<script>
import { get } from 'lodash-es'

export default {
  props: {
    item: { type: Object, required: true },
    opened: { type: Object, default: null },
    isCollapsed: Boolean
  },
  data () {
    return {
      isOpened: false
    }
  },
  computed: {
    isShown () {
      // TODO: Perhaps make the default false after all permissions have been defined.
      return get(this.$auth.user.permission, this.item.permission, true)
    },
    hasChildren () {
      return this.item.submenu && this.item.submenu.length
    },
    submenu () {
      // TODO: Perhaps make the default false after all permissions have been defined.
      return (this.item.submenu ?? []).filter(i => get(this.$auth.user.permission, i.permission, true))
    }
  },
  watch: {
    opened (newVal) {
      if (newVal && newVal.label !== this.item.label) {
        this.isOpened = false
      }
    }
  },
  mounted () {
    const updateIsOpened = () => {
      this.isOpened = this.hasChildren && this.$route.path.startsWith(this.item.matched)
    }

    updateIsOpened()

    this.$once('hook:beforeDestroy', this.$router.afterEach(updateIsOpened))
  },
  methods: {
    onItemClick () {
      if (this.item.to) {
        this.openSubItem()
      } else {
        this.toggleSubMenu()
      }
    },
    toggleSubMenu () {
      if (this.isOpened) {
        this.isOpened = false
      } else {
        this.openSubItem()
      }
    },

    openSubItem () {
      if (this.hasChildren) {
        this.isOpened = true
      }
      this.$emit('opened', this.item)
    }
  }
}
</script>

<style lang="scss">
.cw-sidebar {
  &__item-container {
    margin-top: 20px;
    padding: 0 25px;
    cursor: pointer;
    font-size: 18px;

    &:first-child {
      margin-top: 0;
    }

    &.is-opened {
      .cw-sidebar {
        &__title {
          font-weight: bold;
        }

        &__item {
          margin-bottom: 20px;
        }
      }
    }

    &.is-collapsed {
      .cw-sidebar {
        &__item:hover {
          .cw-sidebar__mark {
            opacity: 0;
          }
        }

        &__title {
          flex: initial;
          text-overflow: initial;
        }

        &__chevron {
          padding-left: 20px;
        }

        &__submenu {
          padding-left: 44px;

          &__item {
            padding-left: 20px;
          }

          &__title {
            text-overflow: clip!important;
            margin-right: 20px;
          }

          .cw-sidebar__mark {
            opacity: 1;
          }
        }
      }
    }
  }

  &__item, &__submenu__item {
    display: flex;
    color: #262626;
    width: 100%;
    align-items: center;
    cursor: pointer;

    &:hover {
      @media (min-width: 769px) {
        text-decoration: none;
        @apply text-black;

        .cw-sidebar__mark {
          opacity: 1;
        }
      }
    }

    &.nuxt-link-exact-active {
      .cw-sidebar__mark {
        @apply bg-cw-red opacity-100;
      }
    }
  }

  &__item {
    &.nuxt-link-active {
      .cw-sidebar__mark {
        opacity: 1;
      }
    }
  }

  &__submenu {
    padding-left: 64px;

    &__item {
      margin-bottom: 8px;
      letter-spacing: -0.21px;
      overflow: hidden;
    }

    .cw-sidebar__mark {
      margin-right: 8px;
      margin-bottom: 2px;
      height: 20px;
    }
  }

  &__icon {
    margin-right: 15px;
    display: flex;
  }

  &__mark {
    width: 5px;
    min-width: 5px;
    opacity: 0;
    height: 25px;
    @apply bg-gray-750;
  }

  &__title {
    flex: 1;
    font-weight: normal;
    margin-left: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__chevron {
    display: flex;
    margin-left: auto;
    padding-left: 5px;
    transition: padding-left .3s;

    &.disabled {
      cursor: auto;
    }
  }
}
</style>
