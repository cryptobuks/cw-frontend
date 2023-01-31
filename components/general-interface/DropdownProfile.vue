<template>
  <base-popover
    class="cw-dropdown-profile"
    :offset-x="20"
    :offset-y="20"
    keep-alive
  >
    <template #activator="{ active: popoverShown }">
      <cw-navbar-item
        v-if="$auth.user"
        :label="$auth.user.displayName"
        :active="active"
      >
        <template #icon>
          <div
            v-tippy="$mq === 'fullhd' ? false : $auth.user.displayName"
            class="cw-dropdown-profile__avatar"
            :class="{ 'cw-dropdown-profile__avatar--active': active }"
          >
            <img :src="$utils.getAvatarUrl($auth.user.avatar)">
          </div>
        </template>

        <template #label>
          <template v-if="$mq === 'fullhd'">
            {{ $auth.user.displayName }}
          </template>

          <base-icon size="16" :rotate="popoverShown ? -180 : 0" class="ml-1">
            chevron-down
          </base-icon>
        </template>
      </cw-navbar-item>
    </template>

    <template #default="{ hide: hidePopover, active: popoverShown }">
      <div class="cw-dropdown-profile__body">
        <cw-other-profiles
          :shown="popoverShown"
          @change="hidePopover"
        />

        <base-scroll class="cw-dropdown-profile__items" @click.native="hidePopover">
          <base-link
            v-for="item in items"
            :key="item.label"
            :to="item.to"
            class="cw-dropdown-profile__item"
            @click.native="item.click && item.click()"
          >
            <base-icon size="25">
              {{ item.icon }}
            </base-icon>

            <div class="cw-dropdown-profile__item__label capitalize">
              {{ $t(item.label) }}
            </div>

            <base-icon size="16">
              chevron-right
            </base-icon>
          </base-link>
        </base-scroll>
      </div>
    </template>
  </base-popover>
</template>

<script>
export default {
  props: {
    items: { type: Array, default: () => [] },
    active: Boolean
  }
}
</script>

<style lang="scss">
.cw-dropdown-profile {
  flex-grow: 1;
  flex-basis: 0%;

  &__avatar {
    width: 42px;
    height: 42px;
    @apply relative overflow-hidden rounded-1/2;

    &::after {
      content: "";
      transition: border-width .2s;
      @apply block absolute inset-0 rounded-1/2 border-2 border-black;
    }

    &--active::after {
      border-width: 3px;
    }

    img {
      @apply w-full h-full object-cover;
    }
  }

  &__body {
    width: 310px;
    @apply bg-white bg-opacity-90 overflow-hidden py-5 px-1 rounded-t-none rounded-b-10px shadow;
  }

  &__items {
    max-height: 300px;
    @apply flex flex-col;
  }

  &__item {
    @apply text-black mt-5 flex justify-between items-center pb-1;

    &:first-child {
      @apply mt-0;
    }

    .base-icon:first-child {
      @apply flex-shrink-0 ml-5 mr-6;
    }

    &__label {
      font-size: 18px;
      flex-grow: 1;
      color: #434343;
    }
  }
}
</style>
