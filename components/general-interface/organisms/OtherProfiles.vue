<template>
  <base-scroll
    v-if="shown && managedProfiles.length > 1"
    scroll-on-drag
    class="cw-other-profiles"
  >
    <div v-lazy-container class="cw-other-profiles__items">
      <div
        v-for="(profile, i) in sortedManagedProfiles"
        :key="profile.id"
        class="cw-other-profiles__item"
        @click="selectProfile(profile)"
      >
        <div class="cw-other-profiles__img">
          <img :data-src="$utils.getAvatarUrl(profile.avatar)">

          <base-icon
            v-if="i === 0"
            name="check-circle"
            class="cw-other-profiles__check"
          />
        </div>
        <p v-auto-resize-text="{ min: 10 }" class="cw-other-profiles__name">
          {{ profile.displayName }}
        </p>
      </div>
    </div>
  </base-scroll>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  props: {
    shown: { type: Boolean, default: true }
  },
  computed: {
    ...mapState('profile', ['managedProfiles']),
    sortedManagedProfiles () {
      if (!this.$auth.isAuthenticated) {
        return []
      }
      const profiles = [...this.managedProfiles]
      const activeProfileIndex = profiles.findIndex(
        p => p._id === this.$auth.user._id
      )
      if (activeProfileIndex === -1) {
        return this.managedProfiles
      }
      profiles.unshift(profiles.splice(activeProfileIndex, 1)[0])
      return profiles
    }
  },
  created () {
    this.getManagedProfiles()
  },
  methods: {
    ...mapActions('profile', ['getManagedProfiles']),
    async selectProfile (profile) {
      this.$emit('change', profile)
      this.$nuxt.$emit('chat:load')

      if (profile._id !== this.$auth.user._id) {
        await this.$repos.profileRepo.switchProfile(profile._id)
        window.location.href = '/home'
      }
    }
  }
}
</script>

<style lang="scss">
.cw-other-profiles {
  @apply mb-3 pb-4;

  &__items {
    padding: 0 5px 0 2px;
    @apply flex;
  }

  &__item {
    @apply flex-shrink-0 flex flex-col justify-center items-center relative cursor-pointer;
  }

  &__img {
    background-color: #dfe5e7;
    @apply border border-gray-500 relative mb-1 h-15 w-15 rounded-md;

    img {
      @apply h-full w-full object-cover rounded-md;
    }
  }

  &__name {
    width: 85px;
    line-height: 18px;
    vertical-align: sub;
    margin: auto;
    @apply h-4 mx-1 p-0 text-xs font-semibold text-center;
  }

  &__check {
    @apply text-red text-sm absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 z-10;
  }
}
</style>
