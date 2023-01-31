<template>
  <base-swipe-card
    container-class="card-container"
    :class="{ 'cursor-pointer': !isExpanded }"
    :actions="[
      { icon: 'bin', color: '#ffffff', danger: true, handler: () => {} },
      { icon: 'copy', bgColor: '#2c57f4', color: '#ffffff', handler: () => {} },
      { icon: 'pen', handler: () => {} }
    ]"
    :hide-actions="isExpanded"
    v-bind="$attrs"
    v-on="$listeners"
    @click="isExpanded = true"
  >
    <template #title>
      <div class="flex text-sm">
        <h3 class="flex-1 truncate">
          Private Lesson
        </h3>
        <span>13:00 - 14:00</span>
        <button v-show="isExpanded" class="absolute text-white text-opacity-75 top-0 right-0 mt-4 mr-4" @click.stop="isExpanded = false">
          <base-icon name="chevron-up" />
        </button>
      </div>
    </template>

    <div v-if="!isExpanded" class="-mt-1 mb-2">
      <div class="text-white text-opacity-90 space-y-2 mt-2">
        <div class="flex text-xs">
          <div class="flex items-center w-4/5">
            <img src="~/static/images/sample/profile-business.png" class="flex-shrink-0 w-6 h-6 border-2 rounded-full">
            <div class="ml-2 truncate">
              Sala Blue New York City
            </div>
          </div>
          <div class="flex items-center w-1/5 text-white text-opacity-60">
            <base-icon name="person" />
            <span class="ml-1">10</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="my-2">
      <div class="text-white text-opacity-90 space-y-2 mt-2">
        <div class="flex text-xs">
          <div class="flex items-center w-4/5">
            <img src="~/static/images/sample/profile-business.png" class="flex-shrink-0 w-6 h-6 border-2 rounded-full">
            <div class="ml-2 truncate">
              Sala Blue New York City
            </div>
          </div>
          <div class="flex items-center w-1/5 text-white text-opacity-60">
            <base-icon name="person" />
            <span class="ml-1">10</span>
          </div>
        </div>
        <div class="flex text-xs">
          <div class="flex items-center w-4/5">
            <img src="~/static/images/sample/profile-business.png" class="flex-shrink-0 w-6 h-6 border-2 rounded-full">
            <div class="ml-2 truncate">
              Sala Paris green
            </div>
          </div>
          <div class="flex items-center w-1/5 text-white text-opacity-60">
            <base-icon name="person" />
            <span class="ml-1">7</span>
          </div>
        </div>
        <div class="flex text-xs">
          <div class="flex items-center w-4/5">
            <base-icon name="wifi" class="flex-shrink-0" :size="20" style="margin-left: 2px" />
            <div class="ml-2 truncate">
              Collegamento da remoto
            </div>
          </div>
          <div class="flex items-center w-1/5 text-white text-opacity-60">
            <base-icon name="person" />
            <span class="ml-1">12</span>
          </div>
        </div>
      </div>

      <div class="flex items-center cursor-pointer mt-2">
        <div class="flex items-center flex-1 ml-3">
          <img v-for="n in 9" :key="n" src="~assets/img/default-contact-avatar.svg" class="flex-shrink-0 w-6 h-6 rounded-full -ml-3">
          <span class="flex justify-center items-center bg-gray-500 text-xs w-6 h-6 rounded-full ml-5">39</span>
        </div>
        <base-icon name="chevron-right" class="text-white text-opacity-75" />
      </div>

      <div class="flex items-center mt-2">
        <base-icon name="bell" size="18" class="text-white text-opacity-90" />
        <span class="text-sm ml-2">30 minutes before</span>
      </div>

      <div class="flex items-center mt-2">
        <base-icon name="appointment-recurrence" size="18" class="text-white text-opacity-90" />
        <span class="text-sm ml-2">Every 2 weeks | up to 06/09/2021</span>
      </div>

      <div class="text-sm mt-2">
        CONI Reporting Active!
      </div>

      <section class="mt-2">
        <h4 class="text-sm">
          Notes
        </h4>
        <p class="text-xs text-white text-opacity-75 mt-1">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Eos soluta aperiam omnis tempore architecto commodi!
        </p>
      </section>
    </div>

    <template #footer>
      <div class="grid grid-cols-3 justify-items-stretch w-full text-white">
        <button
          class="py-2 text-sm font-bold border-r border-gray-600"
          @click.stop
        >
          INVITE
        </button>
        <button class="py-2 border-r border-gray-600" @click.stop>
          <base-icon name="share" size="20" />
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
  props: {
    appointment: { type: Object, default: () => ({}) }
  },
  data: () => ({
    isExpanded: false
  })
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
