<template>
  <div
    class="flex items-center h-18 pl-5 pr-4 text-xs text-gray-750 border-b border-gray-750 border-opacity-25 cursor-pointer hover:bg-white lg:h-24 lg:pl-3 lg:pr-8 lg:text-base transition duration-150 ease-in-out"
    :class="{ 'bg-white': isActive }"
  >
    <div class="flex items-center w-full">
      <cw-profile-avatar
        :size="isMobileOrTablet ? 10 : 14"
        :src="$utils.getAvatarUrl(group.avatar, 'group')"
        :alt="group.name"
        :is-group="true"
      />
      <div class="min-w-0 w-full">
        <div class="ml-5">
          <div class="flex justify-between items-center">
            <span class="font-poppins-bold pr-2 truncate">
              {{ group.name }}
            </span>
            <span class="flex justify-center items-center flex-shrink-0 w-10  text-opacity-50 text-gray-750" :style="{ fontSize: isMobileOrTablet ? '10px' : null}">10:20</span>
          </div>
          <div class="flex justify-between items-center mt-2">
            <div class="flex items-center min-w-0">
              <span v-if="lastMessageSender" class="font-bold">{{ lastMessageSender }}:</span>
              <span class="ml-1 truncate">
                {{ group.lastMessage && group.lastMessage.content.text }}
              </span>
            </div>
            <div v-show="true" class="flex justify-center items-center flex-shrink-0 w-10">
              <!-- TODO: Display number of new messages -->
              <!-- <span
                class="flex items-center justify-center w-5 h-5 text-white rounded-full lg:w-8 lg:h-8"
                :class="{ 'read-unanswered-status': true, 'unread-status': false }"
              >
                16
              </span> -->
            </div>
          </div>
        </div>
      </div>
    </div>
    <svg class="flex-shrink-0 fill-current text-gray-750 text-opacity-50 w-2 h-2 md:hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
      <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z" />
    </svg>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    group: { type: Object, required: true }
  },
  computed: {
    ...mapState('chat', ['currentChat', 'friends']),
    isActive () {
      return this.currentChat?._id === this.group._id
    },
    lastMessageSender () {
      return this.friends[this.group.lastMessage?.fromProfileId]?.displayName?.split(' ')[0]
    },
    isMobileOrTablet () {
      return ['mobile', 'tablet'].includes(this.$mq)
    }
  }
}
</script>

<style lang="postcss" scoped>
.read-unanswered-status {
  @apply bg-cw-red;
}

.unread-status {
  background-color: #68d79b;
}
</style>
