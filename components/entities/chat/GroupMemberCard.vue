<template>
  <div class="card-wrapper">
    <div class="flex w-full">
      <!-- TODO: Get profile photo -->
      <cw-profile-avatar :src="$utils.getAvatarUrl()" :size="isMobileOrTablet ? 10 : 14" />
      <div class="w-full min-w-0 ml-2 lg:mt-1">
        <div class="font-poppins-bold truncate">
          {{ member.displayName || member.profileId }}
        </div>
        <div class="flex justify-between w-full">
          <!-- TODO: Fill with join and suspended dates -->
          <div class="text-xs mt-1">
            13.01.2020
          </div>
          <base-switcher
            v-if="!hideStatus"
            class="border border-black border-opacity-25 rounded-full self-end"
            :class="{ 'pointer-events-none': $auth.user._id === member.profileId }"
            :value="member.status === 'active'"
            true-text="active"
            false-text="suspended"
            false-color="#be0000"
            @input="onInput"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    member: { type: Object, required: true },
    hideStatus: Boolean
  },
  computed: {
    isMobileOrTablet () {
      return ['mobile', 'tablet'].includes(this.$mq)
    }
  },
  methods: {
    onInput (value) {
      if (value) {
        this.$emit('activate', this.member.profileId)
      } else {
        this.$emit('suspend', this.member.profileId)
      }
    }
  }
}
</script>

<style lang="postcss" scoped>
.card-wrapper {
  box-shadow: 1px 2px 5px rgba(0,0,0,0.5);
  @apply w-full text-xs text-gray-750 px-2 py-4 border rounded-10px;

  @screen lg {
    @apply text-base;
  }
}
</style>
