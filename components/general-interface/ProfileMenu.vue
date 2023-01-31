<template>
  <cw-navbar-item dark class="cw-profile-menu">
    <template #icon>
      <base-modal
        ref="modal"
        light
        body-class="px-0 py-0"
        class="cw-profile-menu__avatar"
        :class="{ 'cw-profile-menu__avatar--active': active }"
      >
        <template #activator>
          <img :src="$utils.getAvatarUrl($auth.user.avatar)">
        </template>

        <div class="cw-profile-menu__body">
          <cw-other-profiles @change="$refs.modal.hide()" />

          <base-scroll class="cw-profile-menu__items">
            <cw-vertical-menu-item
              v-for="item in items"
              :key="item.label"
              :item="item"
              :opened="opened"
              @opened="opened = $event"
              @click.native="item.click && item.click()"
            />
          </base-scroll>
        </div>
      </base-modal>
    </template>
  </cw-navbar-item>
</template>

<script>
export default {
  name: 'CwProfileMenu',
  props: {
    items: {
      type: Array,
      default: () => []
    },
    active: Boolean
  },
  data () {
    return {
      opened: null
    }
  }
}
</script>

<style lang="scss">
.cw-profile-menu {
  &__avatar {
    width: 23px;
    height: 23px;
    min-width: 23px;
    @apply relative overflow-hidden rounded-1/2;

    &::after {
      content: "";
      transition: border-width .2s;
      @apply block absolute inset-0 rounded-1/2 border border-white;
    }

    &--active {
      &::after {
        border-width: 3px;
      }
    }

    img {
      @apply w-full h-full object-cover;
    }
  }

  &__body {
    @apply text-black px-0 py-5 overflow-hidden h-full opacity-95;
  }

  &__items {
    max-height: calc(100% - 110px);
    @apply pb-5;
  }
}
</style>
