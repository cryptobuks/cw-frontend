<template>
  <div class="flex w-full" :class="'flex-row'" v-bind="$attrs">
    <div
      class="bg-opacity-25 text-white text-center bg-yellow-300 w-6 rounded-r-lg transform rotate-180 text-vertical-rl"
    >
      <span class="text-xs uppercase">MESSAGE</span>
    </div>
    <div
      class="bg-gray-300 bg-opacity-75 w-full space-y-2 flex flex-col p-3 rounded-r-lg"
    >
      <p v-if="message.isManaged" class="text-sm">
        Message to manage
      </p>
      <p v-if="!message.isViewed" class="text-sm">
        Message to read
      </p>
      <div class="flex justify-between flex-wrap items-center space-x-3">
        <div class="flex">
          <img
            v-if="profile && profile.avatar"
            :src="$utils.getAvatarUrl(profile.avatar)"
            alt="Business Profile"
            class="w-6 h-6 rounded-full object-cover mr-1"
          >
          <img
            v-else
            src="/images/user-placeholder.svg"
            alt="Business Profile"
            class="w-6 h-6 rounded-full object-cover mr-1"
          >
          <span class="font-bold text-xs">{{
            profile && profile.displayName
          }}</span>
        </div>
        <span class="text-right">{{
          $utils.getDashbaoardDateOrTime(message.createdAt)
        }}</span>
      </div>
      <div class="px-3 py-2 overflow-y-auto">
        <!-- <span class="text-xs">Danza Calssica Baby</span>
            <span class="text-xs">Scade || 03.08.2019</span> -->
        <span
          class="text-xs break-all truncate-text"
          style="max-height: 100px"
          v-html="message.data.message"
        />
        <button
          class="h-5 w-5 bg-white rounded-full float-right flex items-center justify-center"
          @click.stop="deleteCard(message._id)"
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
    message: {
      type: Object, // set to null if you're not passing an object here
      required: true,
      default: () => {}
    }
  },
  computed: {
    profile () {
      if (!this.message.fromProfileId) {
        return null
      }
      return this.$store.getters['chat/getFriend'](this.message.fromProfileId)
    }
  },
  methods: {
    deleteCard (id) {
      this.$repos.profileRepo
        .deleteCardMessage({ messageId: id })
        .then((res) => {
          if (res.success) {
            this.$notifier.success('Message removed successfully')
          }
        })
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
