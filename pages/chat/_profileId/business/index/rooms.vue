<template>
  <base-main-card
    v-bind="$attrs"
    title="Rooms"
    :body-class="`flex flex-col h-full ${!loading ? 'bg-white p-4' : ''}`"
    :actions="[
      { icon: 'search' },
      { icon: 'add', handler: () => $refs.modal.show('create') }
    ]"
    show-back-button
    v-on="$listeners"
  >
    <!-- <cw-rooms-modal ref="modal" :gym-id="profile._id" @success="setRooms" /> -->

    <base-card-loading v-if="loading" />
    <div v-else class="flex flex-col space-y-4">
      <div
        v-for="(room, index) in rooms"
        :key="`rooms-${index}`"
        class="shadow-cw-card"
      >
        <div v-if="room.print" class="flex-flex-col p-4">
          <div class="flex justify-between">
            <div class="flex flex-col">
              <span class="text-sm">{{ room.name }}</span>
              <span
                v-if="!room.isVirtual"
                class="text-gray-500 text-xs"
              >Surface: {{ room.surface }}</span>
            </div>
            <div class="flex text-gray-600 space-x-5">
              <base-icon name="printer" size="20" />
              <base-icon
                name="chevron-down"
                size="15"
                class="cursor-pointer"
                @click="room.print = !room.print"
              />
            </div>
          </div>
          <div class="flex justify-center w-full">
            <base-qr-code v-if="room._id" :text="room._id" class="h-40 w-40" />
          </div>
        </div>
        <base-swipe-card
          v-else
          v-slot="{}"
          auto-height
          bg-color="white"
          container-class="text-black"
          class="shadow-cw-card"
          :actions="[{ icon: 'pen' }]"
          toggler-class="text-black"
          @opened="showModal('edit', room)"
        >
          <div class="flex justify-between w-full">
            <div class="flex items-center w-40">
              <base-icon name="qr-code" size="30" />
              <div class="ml-4 space-y-1 flex flex-col">
                <div class="flex">
                  <span
                    class="font-bold text-xs whitespace-nowrap"
                  >{{ room.name }}
                  </span>
                  <base-icon
                    v-if="!room.isVirtual"
                    name="wifi"
                    size="15"
                    class="ml-3"
                  />
                </div>
                <span v-if="!room.isVirtual" class="text-xs">Virtual Room</span>
                <span
                  v-if="room.isVirtual"
                  class="text-xs whitespace-nowrap"
                >Surface: {{ room.surface }}</span>
                <span
                  class="text-xs whitespace-nowrap"
                >Capacity: {{ room.capacity && room.capacity.children }} |
                  {{ room.capacity && room.capacity.adult }}</span>
              </div>
            </div>
            <div class="flex space-y-4 flex-col items-center mr-6">
              <base-icon name="door" size="30" :style="{ color: room.color }" />
              <div class="flex flex-col items-center">
                <base-icon name="performance-index" size="30" />
                <span class="text-xs">Economic</span>
              </div>
            </div>
          </div>
        </base-swipe-card>
      </div>

      <div
        v-if="rooms.length < 1"
        class="mt-3 flex justify-center items-center"
      >
        <h5 class="font-extrabold">
          {{ $t("card.search_empty") }}
        </h5>
      </div>
    </div>
  </base-main-card>
</template>

<script>
import { mapActions, mapState } from 'vuex'
export default {
  inheritAttrs: false,
  props: {
    profile: { type: Object, required: true }
  },
  data () {
    return {
      loading: true,
      modalType: null,
      rooms: []
    }
  },
  computed: {
    ...mapState('gym-hours', ['gymRooms'])
  },
  watch: {
    profile: {
      deep: true,
      immediate: true,
      handler () {
        this.setRooms()
      }
    }
  },
  methods: {
    ...mapActions('gym-hours', ['getGymRooms']),
    showModal (type, roomDetail) {
      this.$refs.modal.show(type, roomDetail)
    },
    async setRooms (gymId) {
      this.rooms = await this.$repos.profileRepo.rooms.get(gymId)
      this.loading = false
    }
  }
}
</script>

<style></style>
