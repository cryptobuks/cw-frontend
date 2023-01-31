<template>
  <base-swipe-card
    :class="{ 'cursor-pointer': !isExpanded }"
    bg-color="#262626"
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
    :hide-actions="isExpanded"
    v-bind="$attrs"
    v-on="$listeners"
    @click="isExpanded = true"
  >
    <template #title>
      <div class="flex text-sm">
        <h3 class="flex-1 truncate">
          Tennis red sand with plenty water
        </h3>
        <span class="ml-8">13:00 - 14:00</span>
        <button
          v-show="isExpanded"
          class="absolute text-white text-opacity-75 top-0 right-0 mt-4 mr-4"
          @click.stop="isExpanded = false"
        >
          <base-icon name="chevron-up" />
        </button>
      </div>
    </template>

    <div class="mt-3 mb-2 flex flex-col space-y-3 w-full text-xs text-gray-600">
      <div v-if="!isExpanded" class="flex items-center justify-between w-full">
        <div class="flex items-center">
          <img
            src="~assets/img/default-contact-avatar.svg"
            class="flex-shrink-0 w-6 h-6 border-2 rounded-full"
          >
          <span class="ml-3 truncate text-white">Court 1</span>
        </div>
        <div class="flex items-center">
          <base-icon name="person" size="10" class="text-white" />
          <span class="ml-1">10</span>
        </div>
      </div>
      <base-scroll
        v-else
        class="h-84 bg-gray-700 -mx-4 flex flex-col p-4 text-xs"
      >
        <div
          v-for="(booking, index) in bookings"
          :key="booking.from"
          class="flex"
        >
          <div class="flex flex-col justify-between w-14">
            <p class="text-white bg-gray-700 -mt-2">
              {{ booking.from }}
            </p>
            <p
              v-if="bookings.length - 1 === index"
              class="text-white bg-gray-700 -mb-2"
            >
              {{ booking.to }}
            </p>
          </div>
          <div
            class="h-14 pb-3 w-full border-t border-gray-600"
            :class="[bookings.length - 1 === index ? 'border-b' : '']"
          >
            <div
              class="bg-white text-black rounded-md w-full mb-4 h-0"
              :style="{
                height: `${(booking.period / rentable.minimumPeriod) * 100}%`
              }"
            >
              <p
                v-if="booking.period / rentable.minimumPeriod >= 1"
                class="font-bold text-xs p-2"
              >
                Full
              </p>
            </div>
          </div>
        </div>
      </base-scroll>
      <div class="flex items-center justify-between">
        <base-multiple-avatars v-bind="{ avatars, count: 8, size: 'xs' }" />
        <base-icon name="chevron-right" size="15" />
      </div>
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
</template>

<script>
export default {
  data: () => ({
    avatars: new Array(25).fill('/images/sample/profile.svg'),
    isExpanded: false,
    rentable: {
      minimumPeriod: 60,
      from: '7:00',
      to: '15:00'
    }
  }),
  computed: {
    bookings () {
      return [
        { from: '7:00', to: '8:00', period: 0 },
        { from: '8:00', to: '9:00', period: 0 },
        { from: '9:00', to: '10:00', period: 0 },
        { from: '10:00', to: '11:00', period: 0 },
        { from: '11:00', to: '12:00', period: 30 },
        { from: '12:00', to: '13:00', period: 45 },
        { from: '13:00', to: '14:00', period: 60 },
        { from: '14:00', to: '15:00', period: 60 },
        { from: '15:00', to: '16:00', period: 60 }
      ]
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
