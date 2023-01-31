<template>
  <div class="flex w-full" :class="'flex-row'" v-bind="$attrs">
    <div
      class="bg-opacity-25 text-white text-center"
      :class="'bg-green w-6 rounded-r-lg transform rotate-180 text-vertical-rl'"
    >
      <span class="text-xs uppercase"> {{ profile.type }}</span>
    </div>
    <div
      class="bg-gray-300 bg-opacity-75 w-full space-y-2 flex flex-col p-3"
      :class="'rounded-r-lg'"
    >
      <div class="flex justify-between flex-wrap items-center space-x-3">
        <div class="flex">
          <img
            v-if="userProfile && userProfile.avatar"
            :src="$utils.getAvatarUrl(userProfile.avatar)"
            alt="Business Profile"
            class="w-6 h-6 rounded-full object-cover mr-1"
          >
          <img
            v-if="!userProfile && $auth.isBusiness()"
            :src="'/images/user-placeholder.svg'"
            alt="Business Profile"
            class="w-6 h-6 rounded-full object-cover mr-1"
          >
          <span class="font-bold text-xs">{{
            userProfile && userProfile.displayName
          }}</span>
        </div>
      </div>
      <div class="px-3 py-2">
        <!-- <span class="text-xs">Danza Calssica Baby</span>
            <span class="text-xs">Scade || 03.08.2019</span> -->
        <span class="text-xs truncate-text" v-html="profile.data.message" />
        <button
          class="h-5 w-5 bg-white rounded-full float-right flex items-center justify-center"
          @click.stop="deleteCard(profile._id)"
        >
          <base-icon name="dismiss" size="8" />
        </button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    profile: {
      type: Object, // set to null if you're not passing an object here
      required: true,
      default: () => {}
    }
  },
  computed: {
    userProfile () {
      if (!this.profile?.fromProfileId) {
        return null
      }
      return this.$store.getters['chat/getFriend'](this.profile?.fromProfileId)
    }
  },
  methods: {
    deleteCard (id) {
      this.$emit('deleteCard', { cardId: id })
    }
  }
}
</script>
<style scoped>
.truncate-text {
  @apply truncate;

  @supports (display: -webkit-box) and (-webkit-line-clamp: 2) and
    (-webkit-box-orient: vertical) {
    text-overflow: initial;
    white-space: initial;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}
</style>
