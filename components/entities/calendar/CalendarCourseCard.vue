<template>
  <div class="relative">
    <button
      v-show="!isExpanded"
      class="absolute top-0 left-0 w-5 h-full rounded-l-10px z-10"
      :style="{ backgroundColor: lesson.color }"
      @click="$emit('filter-course')"
    />
    <base-swipe-card
      container-class="card-container"
      :class="{ 'cursor-pointer': !isExpanded }"
      :actions="[
        { icon: 'bin', color: '#ffffff', danger: true, handler: () => {} },
        {
          icon: 'copy',
          bgColor: '#2c57f4',
          color: '#ffffff',
          handler: () => {}
        },
        { icon: 'pen' }
      ]"
      :style="{ borderLeftWidth: !isExpanded ? '20px' : null }"
      :hide-actions="isExpanded"
      v-bind="$attrs"
      v-on="$listeners"
      @click="isExpanded = true"
    >
      <template #title>
        <div class="flex text-sm">
          <h3 class="flex-1 truncate">
            {{ lesson.courseName }}
          </h3>
          <span>{{ timing }}</span>
          <button
            v-show="isExpanded"
            class="absolute text-white text-opacity-75 top-0 right-0 mt-4 mr-4"
            @click.stop="isExpanded = false"
          >
            <base-icon name="chevron-up" />
          </button>
        </div>
      </template>

      <div v-if="!isExpanded" class="-mt-1 mb-2">
        <div v-for="({ trainerId }, i) in lesson.trainers" :key="i" class="text-xs text-white text-opacity-75 truncate">
          {{ trainersById[trainerId].displayName }}
        </div>
        <div v-for="({ type, roomId, address, capacity }, i) in lesson.location" :key="i" class="text-white text-opacity-90 space-y-2 mt-2">
          <div class="flex text-xs">
            <div class="flex items-center w-4/5">
              <template v-if="type === 'room'">
                <base-icon
                  v-if="assetsById[roomId].type === 'virtual'"
                  name="wifi"
                  class="flex-shrink-0"
                  :size="20"
                  style="margin-left: 2px"
                />
                <img
                  v-else
                  src="~/static/images/sample/profile-business.png"
                  class="flex-shrink-0 w-6 h-6 border-2 rounded-full"
                >
                <div class="ml-2 truncate">
                  {{ assetsById[roomId].name }}
                </div>
              </template>
              <template v-else>
                <base-icon
                  name="map-pin"
                  class="flex-shrink-0"
                  :size="20"
                  style="margin-left: 2px"
                />
                <div class="ml-2 truncate">
                  {{ address.loc }}
                </div>
              </template>
            </div>
            <div class="flex items-center w-1/5 text-white text-opacity-60">
              <base-icon name="person" />
              <span class="ml-1">{{ capacity }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="my-2">
        <div v-for="({ type, roomId, address, capacity }, i) in lesson.location" :key="i" class="text-white text-opacity-90 space-y-2 mt-2">
          <div class="flex text-xs">
            <div class="flex items-center w-4/5">
              <template v-if="type === 'room'">
                <base-icon
                  v-if="assetsById[roomId].type === 'virtual'"
                  name="wifi"
                  class="flex-shrink-0"
                  :size="20"
                  style="margin-left: 2px"
                />
                <img
                  v-else
                  src="~/static/images/sample/profile-business.png"
                  class="flex-shrink-0 w-6 h-6 border-2 rounded-full"
                >
                <div class="ml-2 truncate">
                  {{ assetsById[roomId].name }}
                </div>
              </template>
              <template v-else>
                <base-icon
                  name="map-pin"
                  class="flex-shrink-0"
                  :size="20"
                  style="margin-left: 2px"
                />
                <div class="ml-2 truncate">
                  {{ address.loc }}
                </div>
              </template>
            </div>
            <div class="flex items-center w-1/5 text-white text-opacity-60">
              <base-icon name="person" />
              <span class="ml-1">{{ capacity }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center cursor-pointer mt-2">
          <div class="flex items-center flex-1 ml-3">
            <img
              v-for="n in 9"
              :key="n"
              src="~assets/img/default-contact-avatar.svg"
              class="flex-shrink-0 w-6 h-6 rounded-full -ml-3"
            >
            <span
              class="flex justify-center items-center bg-gray-500 text-xs w-6 h-6 rounded-full ml-5"
            >15</span>
          </div>
          <base-icon name="chevron-right" class="text-white text-opacity-75" />
        </div>

        <section v-if="lesson.description" class="mt-2">
          <h4 class="text-sm">
            Description
          </h4>
          <p class="text-xs text-white text-opacity-75 mt-1">
            {{ lesson.description }}
          </p>
        </section>

        <div class="text-sm mt-2">
          Age suggested: {{ lesson.age.min }} - {{ lesson.age.max }}
        </div>

        <section class="mt-2">
          <h4 class="text-sm">
            Trainers
          </h4>
          <div v-for="({ trainerId, time }, i) in lesson.trainers" :key="i" class="space-y-2 mt-1">
            <div class="flex text-xs text-white text-opacity-75">
              <div class="flex items-center flex-1">
                <img
                  src="~assets/img/default-contact-avatar.svg"
                  class="flex-shrink-0 w-6 h-6 border-2 rounded-full"
                >
                <div class="ml-2 truncate">
                  {{ trainersById[trainerId].displayName }}
                </div>
              </div>
              <div class="flex items-center">
                <span>{{ time.start }} -  {{ time.end }} </span>
                <base-icon
                  name="rotate-cw"
                  size="17"
                  class="text-white text-opacity-90 ml-2"
                />
              </div>
            </div>
          </div>
        </section>

        <button class="text-sm mt-2">
          Booking rules
        </button>

        <div v-if="lesson.reporting" class="text-sm mt-2">
          CONI Reporting Active!
        </div>

        <section v-if="lesson.note" class="mt-2">
          <h4 class="text-sm">
            Notes
          </h4>
          <p class="text-xs text-white text-opacity-75 mt-1">
            {{ lesson.note }}
          </p>
        </section>
      </div>

      <template #footer>
        <div class="grid grid-cols-3 justify-items-stretch w-full text-white">
          <button class="py-2 border-r border-gray-600" @click.stop>
            <base-icon name="share" size="20" />
          </button>
          <button
            class="py-2 text-sm font-bold border-r border-gray-600"
            @click.stop
          >
            BOOK
          </button>
          <button class="py-2 relative" @click.stop>
            <p class="text-2xs absolute top-0 right-0 pr-2">
              57C
            </p>
            <base-icon name="shopping" size="20" />
          </button>
        </div>
      </template>
    </base-swipe-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    lesson: { type: Object, required: true }
  },
  data: () => ({
    isExpanded: false
  }),
  computed: {
    ...mapGetters('calendar', ['assetsById', 'trainersById']),
    timing () {
      const { start, end } = this.lesson.datetime
      const s = new Date(start)
      const e = new Date(end)

      return `${this.$utils.formatTime(s)} - ${this.$utils.formatTime(e)}`
    }
  }
}
</script>

<style lang="postcss" scoped>
.swipe-card {
  min-height: initial;

  & ::v-deep .swipe-card__actions__item {
    min-height: 2rem;
  }

  & ::v-deep footer {
    @apply -mx-4 -mb-4 border-t-2 border-white border-opacity-50;
  }
}

::v-deep .card-container {
  max-width: 320px;
  @apply bg-black;
}
</style>
